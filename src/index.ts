import * as superagent from 'superagent';
import * as Utilities from "./utility";
import { SecuritySystem } from "./SecuritySystem";
import { SecuritySystemCommand } from "./definitions";

superagent.parse['application/xml'] = Utilities.parseXML;
let SS = new SecuritySystem("192.168.1.8", "homebridge", "4779");

SS.login().then(()=> {
//    SS.sendCommand(1, SecuritySystemCommand.AREA_AWAY).then(()=> {
//    SS.sendCommand(1, SecuritySystemCommand.AREA_STAY).then(()=> {
//    SS.sendCommand(1, SecuritySystemCommand.AREA_DISARM).then(()=> {
    SS.sendCommand(1, SecuritySystemCommand.AREA_CHIME_TOGGLE).then(()=> {
    SS.logout();
  });
});
