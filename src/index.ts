import { SecuritySystem } from "./SecuritySystem";

var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' }).required(['ip', 'username', 'pin']);

let SS = new SecuritySystem(nconf.get('ip'), nconf.get('username'), nconf.get('pin'));

SS.login().then(()=> {
  if (nconf.any('monitor')) SS.monitor();
  else {
    SS.sendCommand().then(()=> {
        SS.logout();
    });
  }
});
