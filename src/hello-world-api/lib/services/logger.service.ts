import { debuglog } from 'util';
import { Color } from '../models/color';

interface ILoggerService {
  debug(key: string): (...args: any[]) => void;
  log(color: Color, message: string): void;
}

function debug(key: string) {
  return debuglog(key);
}

function log(color: Color, message: string): void {
  // tslint:disable-next-line:no-console
  console.log(color, message);
}

export const loggerService: ILoggerService = {
  debug,
  log,
};
