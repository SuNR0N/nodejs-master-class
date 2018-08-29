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

import { environment } from './config/config';
import { UNKNOWN_ERROR } from './lib/constants/messages';
import { HTTPError } from './lib/errors/http-error';
import { handlers } from './lib/handlers';
import { RequestHandler } from './lib/handlers/types';
import { helpers } from './lib/helpers';
import {
  IErrorDTO,
  IRequestData,
} from './lib/interfaces';

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
    let statusCode: number;
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

      res.writeHead(statusCode!);
      res.end(payload);

      // tslint:disable-next-line:no-console
      console.log(`Returning this response: ${payload} with a status code: ${statusCode!}`);
    }
  });
};

// Define a request router
const router: { [key: string]: RequestHandler } = {
  ping: handlers.ping,
  users: handlers.users,
};

// Instantiate the HTTP server
const httpServer = createHttpServer(requestListener);

// Start the HTTP server
httpServer.listen(environment.httpPort, () => {
  // tslint:disable-next-line:no-console
  console.info(`The HTTP server is listening on port ${environment.httpPort} in ${environment.envName} mode`);
});

// Instantiate the HTTPS server
const httpsServerOptions: ServerOptions = {
  cert: readFileSync(join(__dirname, './https/cert.pem')),
  key: readFileSync(join(__dirname, './https/key.pem')),
};
const httpsServer = createHttpsServer(httpsServerOptions, requestListener);

// Start the HTTPS server
httpsServer.listen(environment.httpsPort, () => {
  // tslint:disable-next-line:no-console
  console.info(`The HTTPS server is listening on port ${environment.httpsPort} in ${environment.envName} mode`);
});
