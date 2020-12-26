import * as parser from 'fast-xml-parser';
import * as superagent from 'superagent';

export function CheckIPAddress(ipaddress: string) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
    return (true);
  else return (false);
}

export function parseXML(str: String) { return parser.convertToJson(str); }

export async function makeRequest(address: string, payload = {}) {
  return await superagent.post(address).type('form').send(payload);
}

export function nextSequence (last: number) {
  if (last < 256)
    return (last + 1);
  return 1;
}
