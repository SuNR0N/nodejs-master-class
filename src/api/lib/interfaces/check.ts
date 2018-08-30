export interface ICheck {
  id: string;
  protocol: string;
  successCodes: number[];
  timeoutSeconds: number;
  url: string;
  userPhone: string;
}
