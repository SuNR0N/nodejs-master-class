const httpStatusTexts: { [key: number]: string } = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  415: 'Unsupported Media Type',
  500: 'Internal Server Error',
  501: 'Not Implemented',
};

export class HTTPError extends Error {
  constructor(
    public code: number,
    public message: string = httpStatusTexts[code],
  ) {
    super(message);
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}
