export interface ICheckRequestDTO {
  method: string;
  protocol: string;
  successCodes: number[];
  timeoutSeconds: number;
  url: string;
}
