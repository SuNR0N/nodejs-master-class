import { HTTPError } from '../errors/http-error';
import {
  IRequestData,
  IResponseData,
} from '../interfaces';
import { RequestHandler } from './types';

interface ICommonHandlers {
  notFound: RequestHandler;
}

async function notFound(_data: IRequestData): Promise<IResponseData> {
  throw new HTTPError(404);
}

export const commonHandlers: ICommonHandlers = {
  notFound,
};
