import * as Utilities from "./utility";
import * as superagent from 'superagent';
import { Vendor } from "./definitions";
import { Area } from "./definitions";
import { AreaBank } from "./definitions";
import { AreaState } from "./definitions";
import { SecuritySystemCommand } from "./definitions";

export class SecuritySystem {
  protected username: string;
  protected passcode: string;
  protected IPAddress: string;

  protected sessionID: string = "";
  protected vendor: Vendor = Vendor.UNDEFINED;
  protected version: string = "";
  protected release: string = "";

  protected _isMaster: Boolean = false;
  protected _isInstaller: Boolean = false;

  protected lastUpdate: Date = new Date();
  protected areas: Area[] = [];
  protected zones = [];
  protected __extra_area_status: string[] = [];
  protected _zsequence = [];
  protected _zbank = [];
  protected _zvbank = [];

  constructor(address: string, userid: string, pin: string) {
    if (Utilities.CheckIPAddress(address))
      this.IPAddress = address;
    else throw new Error("Not a valid IP address");

    if(typeof userid!='undefined' && userid)
      this.username = userid;
    else throw new Error("Did not specify a username");

    if(typeof pin!='undefined' && pin)
      this.passcode = pin;
    else throw new Error("Did not specify a user PIN");
  }

  async login() {
    try {
      // Attempting login
      let payload = ({lgname: this.username, lgpin: this.passcode});
      const response = await Utilities.makeRequest('http://' + this.IPAddress + '/login.cgi', payload)
      var correctLine: string = "";
      const loginPageLine: number = 25;
      const sessionIDLine: number = 28;
      const vendorDetailsLine: number = 6;
      var data = response.text;
      var lines1 = data.split("\n");
      var lines2 = lines1;
      var lines3 = lines1;

      // Gotta check for successful login
      correctLine = lines1[loginPageLine].trim();
      if (correctLine.substr(25,7) === 'Sign in')
            throw new Error('Login Unsuccessful');

      // Login confirmed, parsing session ID
      correctLine = lines2[sessionIDLine].trim();
      this.sessionID = correctLine.substr(30, 16);

      // Parsing panel vendor and software details
      correctLine = lines3[vendorDetailsLine].trim();
      let vendorDetails = correctLine.split(/[/_-]/);
      switch (vendorDetails[2]) {
        case "ZW": { this.vendor = Vendor.ZEROWIRE; break; }
        case "CN": { this.vendor = Vendor.COMNAV; break; }
        default: { throw new Error("Unrecognized vendor"); }
      }
      this.version = vendorDetails[3];
      this.release = vendorDetails[4];

      this.lastUpdate = new Date();

      console.log('Connected successfully to panel at IP address ' + this.IPAddress);
      console.log('Detected ' + this.vendor + ' NX-595E, Web Interface v' + this.version + '-' + this.release);
      console.log('Session ID is ' + this.sessionID);
      console.log('Last Update at: ' + this.lastUpdate.toLocaleString());

      // Start retrieving area and zone details; pass through the initial Response
      this.retrieveAreas(response);
      return (true);
    } catch (error) { console.error(error); return (false); }
  }

  async logout() {
    try {
      if (this.sessionID === "")
        throw new Error('Not logged in');

      // Logout gracefully
      await Utilities.makeRequest('http://' + this.IPAddress + '/logout.cgi')
      this.sessionID = "";
      console.log('Logged out successfully');
    } catch (error) { console.error(error); return (false); }
  }

  async sendCommand(areas: number[] | number = [],
    command: SecuritySystemCommand = SecuritySystemCommand.AREA_CHIME_TOGGLE) {
    try {
      if (this.sessionID === "" && !(this.login())) return (false);
      if (!(command in SecuritySystemCommand)) throw new Error('Invalid alarm state ' + command);

      // Load actual area banks to local table for ease of use
      let actionableAreas: number[] = [];
      let actualAreas: number[] = [];
      for (let i of this.areas) actualAreas.push(i.bank+1);

      // Decipher input and prepare actionableAreas table for looping through
      if (typeof(areas) == 'number') actionableAreas.push(areas);
      else if (Array.isArray(areas) && areas.length > 0) actionableAreas = areas;
      else actionableAreas = actualAreas;

      // For every area in actionableAreas:
      for (let i of actionableAreas) {
        // Check if the actual area exists
        if (!actualAreas.includes(i)) throw new Error('Specified area ' + i + ' not found');
        else {
          // Prepare the payload according to details
          type payloadType = {[key: string]: string};
          let payload: payloadType = {};
          payload['sess'] = this.sessionID;
          payload['comm'] = '80';
          payload['data0'] = '2';
          payload['data1'] = String(1 << (i - 1) % 8);
          payload['data2'] = String(command);

          // Finally make the request
          await Utilities.makeRequest('http://' + this.IPAddress + '/user/keyfunction.cgi', payload);
          console.log('Successfully sent command to area ' + i);
        }
      }
      return true;
    } catch (error) { console.error(error); return false; }
  }

  async retrieveAreas (response: superagent.Response | undefined = undefined) {
    // If we are passed an already loaded Response use that, otherwise reload area.htm
    if (response == undefined) {
      response = await Utilities.makeRequest('http://' + this.IPAddress + '/user/area.htm', {'sess': this.sessionID})
    }

    // Get area sequence
    let regexMatch: any = response.text.match(/var\s+areaSequence\s+=\s+new\s+Array\(([\d,]+)\);/);
    let sequence: number[] = regexMatch[1].split(',');

    // Get area states
    regexMatch = response.text.match(/var\s+areaStatus\s+=\s+new\s+Array\(([\d,]+)\);/);
    let bank_states = regexMatch[1].split(',');

    // Get area names
    regexMatch = response.text.match(/var\s+areaNames\s+=\s+new\s+Array\((\"(.+)\")\);/);
    let area_names: string[] = regexMatch[1].split(',');
    area_names.forEach((item, i, arr) => { arr[i] = item.replace(/['"]+/g, ''); })

    // Pad sequence table to match the length of area_names table
    if (area_names.length - sequence.length > 0) {
      let filler = new Array(area_names.length - sequence.length);
      filler.fill(0);
      sequence = sequence.concat(filler);
    }

    // Reset class areas tables...
    this.areas.length = 0;

    // ... and populate it from scratch
    area_names.forEach((name, i) => {
      // If the name is "!" it's an empty area; ignore it
      if (name == "" || name == "%21") return;

      // Create a new Area object and populate it with the area details, then push it
      let newArea: Area = {
        bank: i,
        name: (name == "" ? 'Area ' + (i+1): name),
        priority: 6,
        sequence: sequence[i],
        bank_state: bank_states.slice(Math.floor((i / 8) * 17), (Math.floor((i / 8) * 17) + 17)),
        status: "",
        states: {}
      };

      this.areas.push(newArea);

      console.log('Successfully retrieved ' + this.areas.length + ' areas from the system');
      return (true);
    });

    this.processAreas();
  }

  private processAreas() {
    // Loop through detected areas
    this.areas.forEach(area => {
      // Define mask for said area
      let mask = (1 << (area.bank % 8));

      // Create virtual states table for ease and readability
      let vbank: number[] = [];
      area.bank_state.forEach(state => {
        vbank.push(state & mask);
      });

      // (Partially) Armed state, exit mode and chime setting booleans
      let st_partial = Boolean(vbank[AreaBank.PARTIAL]);
      let st_armed = Boolean(vbank[AreaBank.ARMED]);
      let st_exit1 = Boolean(vbank[AreaBank.EXIT_MODE01]);
      let st_exit2 = Boolean(vbank[AreaBank.EXIT_MODE02]);
      let st_chime = Boolean(vbank[AreaBank.CHIME]);

      // Priority starts from 6, which is the lowest; can go up to 1
      let priority = 6;

      let status: string = "";

      // Start with index -1
      let index = -1;

      while (status == "") {
        // Increment the index by 1
        index++;
        if (index >= AreaState.Priority.length) {

          // If there are extra area status messages set go into this
          if (this.__extra_area_status.length > 0) {
            status = this.__extra_area_status[index - AreaState.Priority.length];

            // Convert 'No System Faults' to 'Not Ready'
            if (status == "No System Faults") status = AreaState.Status[AreaState.State.NOT_READY_FORCEABLE];
            else status = AreaState.Status[AreaState.State.READY];
          }
          continue;
        }

        // Get virtual index based on priority
        let v_index = AreaState.Priority[index];

        if (vbank[v_index]) {
          if (!(st_armed || st_partial) || AreaState.Status[v_index] !== AreaState.Status[AreaState.State.READY]) {
            status = AreaState.Status[v_index];
          }

          if (AreaState.Status[v_index] !== AreaState.Status[AreaState.State.DELAY_EXIT_1]) {
            // Bump to DELAY_EXIT_2, as it will eventually max out the while loop and move past that
            index++;
          }
        } else if (AreaState.Status[v_index] == AreaState.Status[AreaState.State.READY] && !(st_armed || st_partial)) {
          status = AreaState.Status[AreaState.State.NOT_READY];
        }

        if (vbank[AreaBank.UNKWN_03] || vbank[AreaBank.UNKWN_04] || vbank[AreaBank.UNKWN_05] || vbank[AreaBank.UNKWN_06]) {
          priority = 1;
        } else if (vbank[AreaBank.UNKWN_11] || vbank[AreaBank.UNKWN_12] || vbank[AreaBank.UNKWN_13] || vbank[AreaBank.UNKWN_14] || this.__extra_area_status.length > 0) {
          priority = 2;
        } else if (vbank[AreaBank.UNKWN_10] || st_partial) {
          priority = 3;
        } else if (st_armed) {
          priority = 4;
        } else if (vbank[AreaBank.UNKWN_02]) {
          priority = 5;
        }

        area.priority = priority;
        area.status = status;
        area.states = {
          'armed': st_armed,
          'partial': st_partial,
          'chime': st_chime,
          'exit1': st_exit1,
          'exit2': st_exit2
        };
      }
    });
    console.log('Successfully processed ' + this.areas.length + ' areas.')
    return (true);
  }
}
