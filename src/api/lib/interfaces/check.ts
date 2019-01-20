export interface ICheck {
  id: string;
  method: string;
  protocol: string;
  successCodes: number[];
  timeoutSeconds: number;
  url: string;
  userPhone: string;
  state: string;
  lastChecked: number;
}
