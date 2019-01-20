import {
  IRequestData,
  IResponseData,
} from '../interfaces';
import { loggerService } from '../services/logger.service';
import { RequestHandler } from './types';

const debug = loggerService.debug('hello');

interface IHelloHandlers {
  [key: string]: RequestHandler<any, any>;
  POST: RequestHandler;
}

async function hello(requestData: IRequestData): Promise<IResponseData> {
  debug(requestData.headers, requestData.payload, requestData.qs);
  return {
    payload: { message: 'Hello World' },
    statusCode: 200,
  };
}

export const helloHandlers: IHelloHandlers = {
  POST: hello,
};
