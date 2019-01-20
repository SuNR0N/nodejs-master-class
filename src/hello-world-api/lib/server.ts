import { readFileSync } from 'fs';
import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import {
  createServer as createHttpsServer,
  ServerOptions,
} from 'https';
import { join } from 'path';
import { StringDecoder } from 'string_decoder';
import { parse } from 'url';

import { environment } from '../config/config';
import { UNKNOWN_ERROR } from './constants/messages';
import { HTTPError } from './errors/http-error';
import { handlers } from './handlers';
import { RequestHandler } from './handlers/types';
import { helpers } from './helpers';
import {
  IErrorDTO,
  IRequestData,
} from './interfaces';
import { Color } from './models/color';
import { loggerService } from './services/logger.service';

const debug = loggerService.debug('server');

// All the server logic for both HTTP and HTTPS server
const requestListener = (req: IncomingMessage, res: ServerResponse) => {
  // Get the URL the parse it
  const parsedUrl = parse(req.url!, true);

  // Get the path
  const path = parsedUrl.pathname!;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const qs = parsedUrl.query;

  // Get the HTTP method
  const method = req.method!.toUpperCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => buffer += decoder.write(data));
  req.on('end', async () => {
    buffer += decoder.end();

    // Choose the base handler this request should go to. If one is not found use the notFound handler
    const requestHandlerRegExp = /^(\w+)/;
    const requestHandlerRegExpExec = requestHandlerRegExp.exec(trimmedPath);
    const basePath = requestHandlerRegExpExec && requestHandlerRegExpExec[1];
    const requestHandler: RequestHandler = basePath && router[basePath] ? router[basePath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data: IRequestData = {
      headers,
      method,
      payload: helpers.parseJSONToObject(buffer),
      qs,
      trimmedPath,
    };

    let error: IErrorDTO;
    let payload: string | undefined;
    let statusCode: number = 200;
    try {
      const response = await requestHandler(data);
      statusCode = response.statusCode || 200;
      if (response.payload) {
        payload = JSON.stringify(response.payload);
      }
    } catch (err) {
      if (err instanceof HTTPError) {
        statusCode = err.code;
        error = { message: err.message };
      } else {
        statusCode = 500;
        error = { message: UNKNOWN_ERROR };
      }
      payload = JSON.stringify(error);
    } finally {
      // Return the response
      if (payload) {
        res.setHeader('Content-Type', 'application/json');
      }

      res.writeHead(statusCode);
      res.end(payload);

      if (statusCode === 200 || statusCode === 201) {
        debug(Color.Green, `${method} /${trimmedPath} ${statusCode}`);
      } else {
        debug(Color.Red, `${method} /${trimmedPath} ${statusCode}`);
      }
    }
  });
};

// Define a request router
const router: { [key: string]: RequestHandler } = {
  hello: handlers.hello,
};

// Instantiate the HTTP server
export const httpServer = createHttpServer(requestListener);

// Instantiate the HTTPS server
const httpsServerOptions: ServerOptions = {
  cert: readFileSync(join(__dirname, '../https/cert.pem')),
  key: readFileSync(join(__dirname, '../https/key.pem')),
};
export const httpsServer = createHttpsServer(httpsServerOptions, requestListener);

export function init() {
  // Start the HTTP server
  httpServer.listen(environment.httpPort, () => {
    // tslint:disable-next-line:max-line-length
    loggerService.log(Color.Cyan, `The HTTP server is listening on port ${environment.httpPort} in ${environment.envName} mode`);
  });

  // Start the HTTPS server
  httpsServer.listen(environment.httpsPort, () => {
    // tslint:disable-next-line:max-line-length
    loggerService.log(Color.Magenta, `The HTTPS server is listening on port ${environment.httpsPort} in ${environment.envName} mode`);
  });
}
