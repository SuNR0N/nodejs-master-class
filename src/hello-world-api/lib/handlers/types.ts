import {
  IRequestData,
  IResponseData,
} from '../interfaces';

export type RequestHandler<Q = {}, S = {}> = (requestData: IRequestData<Q>) => Promise<IResponseData<S>>;
