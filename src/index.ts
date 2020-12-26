import * as superagent from 'superagent';
import * as Utilities from "./utility";
import { SecuritySystem } from "./SecuritySystem";

superagent.parse['application/xml'] = Utilities.parseXML;
let SS = new SecuritySystem("192.168.1.8", "User 1", "6997");

SS.login();
SS.logout();
