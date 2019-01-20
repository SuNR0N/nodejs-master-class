import { environment } from '../../config/config';
import {
  appendFileAsync,
  gzipAsync,
  readdirAsync,
  readFileAsync,
  truncateAsync,
  unzipAsync,
  writeFileAsync,
} from '../utils/async.utils';
import { debuglog } from 'util';
import { Color } from '../models/color';

const debug = _debug('logger');

const logExtension = '.log';
const compressedLogExtension = '.gz.b64';

interface ILoggerService {
  append(fileId: string, logEntry: string): Promise<void>;
  compress(fileId: string, newFileId: string): Promise<void>;
  decompress(fileId: string): Promise<string | undefined>;
  list(includeCompressedLogs: boolean): Promise<string[]>;
  truncate(fileId: string): Promise<void>;
  debug(key: string): (...args: any[]) => void;
  log(color: Color, message: string): void;
}

async function append(fileId: string, logEntry: string): Promise<void> {
  const logFilePath = `${environment.logDir}/${fileId}${logExtension}`;
  try {
    await appendFileAsync(logFilePath, `${logEntry}\n`);
  } catch (err) {
    debug(Color.Red, `Error appending to file ${logFilePath}: ${err.message}`);
  }
}

async function list(includeCompressedLogs: boolean): Promise<string[]> {
  try {
    const fileNames = await readdirAsync(environment.logDir);
    return fileNames.reduce((files, fileName) => {
      if (fileName.endsWith(logExtension)) {
        files.push(fileName.replace(logExtension, ''));
      }
      if (fileName.endsWith(compressedLogExtension) && includeCompressedLogs) {
        files.push(fileName.replace(compressedLogExtension, ''));
      }
      return files;
    }, [] as string[]);
  } catch (err) {
    debug(Color.Red, `Error while trying to read files in directory ${environment.logDir}: ${err.message}`);
    return [];
  }
}

async function compress(fileId: string, newFileId: string): Promise<void> {
  const uncompressedFilePath = `${environment.logDir}/${fileId}${logExtension}`;
  const compressedFilePath = `${environment.logDir}/${newFileId}${compressedLogExtension}`;
  try {
    const fileContent = await readFileAsync(uncompressedFilePath, 'utf8');
    const compressedContent = await gzipAsync(fileContent) as Buffer;
    await writeFileAsync(compressedFilePath, compressedContent.toString('base64'));
  } catch (err) {
    debug(Color.Red, `Error while trying to compress ${uncompressedFilePath}: ${err.message}`);
  }
}

async function decompress(fileId: string): Promise<string | undefined> {
  const compressedFilePath = `${environment.logDir}/${fileId}${compressedLogExtension}`;
  try {
    const fileContent = await readFileAsync(compressedFilePath, 'utf8');
    const inputBuffer = Buffer.from(fileContent, 'base64');
    const outputBuffer = await unzipAsync(inputBuffer) as Buffer;
    return outputBuffer.toString('utf8');
  } catch (err) {
    debug(Color.Red, `Error while trying to decompress ${compressedFilePath}: ${err.message}`);
  }
}

async function truncate(fileId: string): Promise<void> {
  const filePath = `${environment.logDir}/${fileId}${logExtension}`;
  try {
    await truncateAsync(filePath);
  } catch (err) {
    debug(Color.Red, `Error while trying to truncate ${filePath}: ${err.message}`);
  }
}

function _debug(key: string) {
  return debuglog(key);
}

function log(color: Color, message: string): void {
  // tslint:disable-next-line:no-console
  console.log(color, message);
}

export const loggerService: ILoggerService = {
  append,
  compress,
  debug: _debug,
  decompress,
  list,
  log,
  truncate,
}