export interface LocalDevice {
  id: string;
  name: string;
  platform: string;
  ip: string;
  port: number;
  version: string;
}

export const SYNCSTUFF_SERVICE_TYPE = "syncstuff";
export const SYNCSTUFF_PROTOCOL = "tcp";
export const SYNCSTUFF_SERVICE_DOMAIN = "local.";
export const SYNCSTUFF_SERVICE_PORT = 3000;

export interface ServiceTxtRecord {
  version: string;
  platform: string;
  deviceId: string;
  deviceName: string;
}
