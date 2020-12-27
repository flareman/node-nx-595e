import * as Utilities from "./utility";
import { Vendor } from "./definitions";

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
  protected areas = [];
  protected zones = [];
  protected __extra_area_status = [];
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

      return (true);
    } catch (error) { console.error(error); return (false); }
  }

  async logout() {
    try {
      if (this.sessionID === "")
        throw new Error('Not logged in');
      await Utilities.makeRequest('http://' + this.IPAddress + '/logout.cgi')
      this.sessionID = "";
      console.log('Logged out successfully');
    } catch (error) { console.error(error); return (false); }
  }
}
