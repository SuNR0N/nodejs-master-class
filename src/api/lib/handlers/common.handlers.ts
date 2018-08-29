import { HTTPError } from '../errors/http-error';
import {
  IRequestData,
  IResponseData,
} from '../interfaces';
import { RequestHandler } from './types';

interface ICommonHandlers {
  notFound: RequestHandler;
  ping: RequestHandler;
}

async function notFound(_data: IRequestData): Promise<IResponseData> {
  throw new HTTPError(404);
}

async function ping(_data: IRequestData): Promise<IResponseData> {
  throw new HTTPError(200);
}

export const commonHandlers: ICommonHandlers = {
  notFound,
  ping,
};
