export enum Vendor {
  ZEROWIRE = "ZEROWIRE",
  COMNAV = "COMNAV",
  UNDEFINED = "NONE"
}
export enum SecuritySystemCommand {
  AREA_CHIME_TOGGLE = 1,
  AREA_DISARM = 16,
  AREA_AWAY = 17,
  AREA_STAY = 18
}

export interface Area {
  name: string;
  bank: number;
  sequence: number;
  bank_state: number[];
}
