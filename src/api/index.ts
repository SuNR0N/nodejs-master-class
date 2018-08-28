import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import {
  createServer as createHttpsServer,
  ServerOptions,
} from 'https';
import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import { readFileSync } from 'fs';
import { join } from 'path';

import { environment } from './config/config';

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
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found use the notFound handler
    const chosenHandler: Function = router[trimmedPath] !== undefined ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      headers,
      method,
      payload: buffer,
      qs,
      trimmedPath,
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode: number, payload: any) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) === 'object' ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(`Returning this response: ${payloadString} with a status code: ${statusCode}`)
    });
  });
};

// Define the handlers
const handlers: { [key: string]: Function } = {};

// Not found handler
handlers.notFound = (_data: any, cb: Function) => {
  cb(404);
};

// Ping handler
handlers.ping = (_data: any, cb: Function) => {
  cb(200);
}

// Define a request router
const router: { [key: string]: Function } = {
  ping: handlers.ping,
};

// Instantiate the HTTP server
const httpServer = createHttpServer(requestListener);

// Start the HTTP server
httpServer.listen(environment.httpPort, () => {
  console.log(`The HTTP server is listening on port ${environment.httpPort} in ${environment.envName} mode`);
});

// Instantiate the HTTPS server
const httpsServerOptions: ServerOptions = {
  key: readFileSync(join(__dirname, './https/key.pem')),
  cert: readFileSync(join(__dirname, './https/cert.pem')),
};
const httpsServer = createHttpsServer(httpsServerOptions, requestListener);

// Start the HTTPS server
httpsServer.listen(environment.httpsPort, () => {
  console.log(`The HTTPS server is listening on port ${environment.httpsPort} in ${environment.envName} mode`);
});
