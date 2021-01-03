import { SecuritySystem } from "./SecuritySystem";
import { SecuritySystemCLIScenes } from "./definitions";

var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' }).required(['ip', 'username', 'pin']);

let SS = new SecuritySystem(nconf.get('ip'), nconf.get('username'), nconf.get('pin'));

SS.login().then(async ()=> {
  if (nconf.any('monitor')) SS.monitor();
  else {
    if (nconf.any('scene')) {
      let command = SecuritySystemCLIScenes[nconf.any('scene')];
      let area: number | number[] = -1;
      if (nconf.any('area')) area = parseInt(nconf.any('area'));
      else area = [];
      await SS.sendCommand(parseInt(command), area);
    } else await SS.sendCommand();
    SS.logout();
  }
});
