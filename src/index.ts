import * as superagent from 'superagent';
import * as Utilities from "./utility";
import { SecuritySystem } from "./SecuritySystem";

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json' }).required(['ip', 'username', 'pin']);

superagent.parse['application/xml'] = Utilities.parseXML;
let SS = new SecuritySystem(nconf.get('ip'), nconf.get('username'), nconf.get('pin'));

SS.login().then(()=> {
  // SS.sendCommand().then(()=> {
    SS.logout();
  // });
});
