import { HTTPError } from '../errors/http-error';
import {
  IRequestData,
  IResponseData,
} from '../interfaces';
import { commonHandlers } from './common.handlers';
import { helloHandlers } from './hello.handlers';
import { RequestHandler } from './types';

interface IRequestHandlers {
  [key: string]: RequestHandler;
  hello: RequestHandler;
  notFound: RequestHandler;
}

async function hello(requestData: IRequestData): Promise<IResponseData> {
  const acceptableMethods = ['POST'];
  if (acceptableMethods.indexOf(requestData.method) !== -1) {
    return await helloHandlers[requestData.method](requestData);
  } else {
    throw new HTTPError(405);
  }
}

export const handlers: IRequestHandlers = {
  hello,
  notFound: commonHandlers.notFound,
};
