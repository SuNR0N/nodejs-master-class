import { HTTPError } from '../errors/http-error';
import {
  IRequestData,
  IResponseData,
} from '../interfaces';
import { checksHandlers } from './checks.handlers';
import { commonHandlers } from './common.handlers';
import { tokensHandlers } from './tokens.handlers';
import { RequestHandler } from './types';
import { usersHandlers } from './users.handlers';

interface IRequestHandlers {
  [key: string]: RequestHandler;
  checks: RequestHandler;
  notFound: RequestHandler;
  ping: RequestHandler;
  tokens: RequestHandler;
  users: RequestHandler;
}

async function checks(requestData: IRequestData): Promise<IResponseData> {
  const acceptableMethods = [
    'DELETE',
    'GET',
    'POST',
    'PATCH',
  ];
  if (acceptableMethods.indexOf(requestData.method) !== -1) {
    return await checksHandlers[requestData.method](requestData);
  } else {
    throw new HTTPError(405);
  }
}

async function tokens(requestData: IRequestData): Promise<IResponseData> {
  const acceptableMethods = [
    'DELETE',
    'GET',
    'POST',
    'PUT',
  ];
  if (acceptableMethods.indexOf(requestData.method) !== -1) {
    return await tokensHandlers[requestData.method](requestData);
  } else {
    throw new HTTPError(405);
  }
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
  checks,
  notFound: commonHandlers.notFound,
  ping: commonHandlers.ping,
  tokens,
  users,
};
