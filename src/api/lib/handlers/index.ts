import { HTTPError } from '../errors/http-error';
import {
  IRequestData,
  IResponseData,
} from '../interfaces';
import { commonHandlers } from './common.handlers';
import { RequestHandler } from './types';
import { usersHandlers } from './users.handlers';

interface IRequestHandlers {
  [key: string]: RequestHandler;
  notFound: RequestHandler;
  ping: RequestHandler;
  users: RequestHandler;
}

async function users(requestData: IRequestData): Promise<IResponseData> {
  const acceptableMethods = [
    'DELETE',
    'GET',
    'PATCH',
    'POST',
  ];
  if (acceptableMethods.indexOf(requestData.method) !== -1) {
    return await usersHandlers[requestData.method](requestData);
  } else {
    throw new HTTPError(405);
  }
}

export const handlers: IRequestHandlers = {
  notFound: commonHandlers.notFound,
  ping: commonHandlers.ping,
  users,
};
