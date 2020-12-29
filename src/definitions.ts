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
  bank: number;
  name: string;
  priority: number;
  sequence: number;
  bank_state: number[];
  status: string;
  states: {};
}

export enum AreaBank {
  ARMED = 0,
  PARTIAL = 1,
  UNKWN_02 = 2,
  UNKWN_03 = 3,
  UNKWN_04 = 4,
  UNKWN_05 = 5,
  UNKWN_06 = 6,
  EXIT_MODE01 = 7,
  EXIT_MODE02 = 8,
  UNKWN_09 = 9,
  UNKWN_10 = 10,
  UNKWN_11 = 11,
  UNKWN_12 = 12,
  UNKWN_13 = 13,
  UNKWN_14 = 14,
  CHIME = 15,
  UNKWN_16 = 16
}

enum _State  {
  ARMED_AWAY = 0,
  ARMED_STAY,
  READY,

  ALARM_FIRE,
  ALARM_BURGLAR,
  ALARM_PANIC,
  ALARM_MEDICAL,

  DELAY_EXIT_1,
  DELAY_EXIT_2,
  DELAY_ENTRY,

  SENSOR_BYPASS,
  SENSOR_TROUBLE,
  SENSOR_TAMPER,
  SENSOR_BATTERY,
  SENSOR_SUPERVISION,

  NOT_READY,
  NOT_READY_FORCEABLE,
  DISARMED
}

export class AreaState {
  static readonly State = _State;

  static readonly Priority: number[] = [
    AreaState.State.ALARM_FIRE,
    AreaState.State.ALARM_BURGLAR,
    AreaState.State.ALARM_PANIC,
    AreaState.State.ALARM_MEDICAL,

    AreaState.State.DELAY_EXIT_1,
    AreaState.State.DELAY_EXIT_2,
    AreaState.State.DELAY_ENTRY,

    AreaState.State.ARMED_AWAY,
    AreaState.State.ARMED_STAY,

    AreaState.State.SENSOR_BYPASS,
    AreaState.State.SENSOR_TROUBLE,
    AreaState.State.SENSOR_TAMPER,
    AreaState.State.SENSOR_BATTERY,
    AreaState.State.SENSOR_SUPERVISION,

    AreaState.State.READY
  ]

  static readonly Status: string[] = [
    'Armed Away',
    'Armed Stay',
    'Ready',
    'Fire Alarm',
    'Burglar Alarm',
    'Panic Alarm',
    'Medical Alarm',
    'Exit Delay 1',
    'Exit Delay 2',
    'Entry Delay',
    'Sensor Bypass',
    'Sensor Trouble',
    'Sensor Tamper',
    'Sensor Low Battery',
    'Sensor Supervision',
    'Not Ready',
    'Not Ready',
    'Disarm'
  ]
}
