import fs from 'fs';
import { promisify } from 'util';
import zlib from 'zlib';

export const appendFileAsync = promisify(fs.appendFile);
export const closeAsync = promisify(fs.close);
export const gzipAsync = promisify(zlib.gzip);
export const openAsync = promisify(fs.open);
export const readdirAsync = promisify(fs.readdir);
export const readFileAsync = promisify(fs.readFile);
export const truncateAsync = promisify(fs.truncate);
export const unlinkAsync = promisify(fs.unlink);
export const unzipAsync = promisify(zlib.unzip);
export const writeFileAsync = promisify(fs.writeFile);
