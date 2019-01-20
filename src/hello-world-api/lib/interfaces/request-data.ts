import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';

export interface IRequestData<T = {}> {
  headers: IncomingHttpHeaders;
  method: string;
  payload: T;
  qs: ParsedUrlQuery;
  trimmedPath: string;
}
