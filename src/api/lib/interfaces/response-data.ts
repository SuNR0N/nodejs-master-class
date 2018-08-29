export interface IResponseData<T = {}> {
  statusCode: number;
  payload?: T;
}
