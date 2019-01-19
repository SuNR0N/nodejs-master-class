import fs from 'fs';
import { promisify } from 'util';

import { environment } from '../../config/config';
import {
  EntityExistsError,
  EntityNotFoundError,
} from '../errors';
import { helpers } from '../helpers';

const closeAsync = promisify(fs.close);
const openAsync = promisify(fs.open);
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const truncateAsync = promisify(fs.truncate);
const unlinkAsync = promisify(fs.unlink);
const writeFileAsync = promisify(fs.writeFile);

export enum Directory {
  Checks = 'checks',
  Tokens = 'tokens',
  Users = 'users',
}

interface IDataService {
  create: (dir: Directory, file: string, content: any) => Promise<void>;
  delete: (dir: Directory, file: string) => Promise<void>;
  read: <T = any>(dir: Directory, file: string) => Promise<T>;
  readAll: <T = any>(dir: Directory) => Promise<T[]>;
  update: (dir: Directory, file: string, content: any) => Promise<void>;
}

function getEntityName(directory: Directory): string {
  return `${directory.charAt(0).toUpperCase()}${directory.slice(1, -1)}`;
}

async function createFile(dir: Directory, file: string, content: any): Promise<void> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    const fileDescriptor = await openAsync(filePath, 'wx');
    const stringContent = JSON.stringify(content);
    await writeFileAsync(fileDescriptor, stringContent);
    return await closeAsync(fileDescriptor);
  } catch (err) {
    const baseMessage = 'Could not create new file';
    switch (err.code) {
      case 'ENOENT':
        throw new Error(`${baseMessage} as it may have a non-existing parent directory`);
      case 'EEXIST':
        throw new EntityExistsError(`${baseMessage} as it may already exist`);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function deleteFile(dir: Directory, file: string): Promise<void> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    return await unlinkAsync(filePath);
  } catch (err) {
    const baseMessage = 'Could not delete file';
    switch (err.code) {
      case 'ENOENT':
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`, getEntityName(dir), file);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function readFile<T = any>(dir: Directory, file: string): Promise<T> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    const content = await readFileAsync(filePath, 'utf8');
    return helpers.parseJSONToObject(content);
  } catch (err) {
    const baseMessage = 'Could not read file';
    switch (err.code) {
      case 'ENOENT':
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`, getEntityName(dir), file);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function readDirectory<T = any>(dir: Directory): Promise<T[]> {
  const dirPath = `${environment.dataDir}/${dir}`;
  try {
    const fileNames = await readdirAsync(dirPath, 'utf8');
    const ids = fileNames
      .filter((fileName) => fileName.match(/\.json$/))
      .map((fileName) => fileName.split('.')[0]);
    const files: T[] = [];
    for (const id of ids) {
      const file = await readFile<T>(dir, id);
      files.push(file);
    }
    return files;
  } catch (err) {
    const baseMessage = 'Could not read directory';
    switch (err.code) {
      case 'ENOENT':
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`, getEntityName(dir), dir);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function updateFile(dir: Directory, file: string, content: any): Promise<void> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    const fileDescriptor = await openAsync(filePath, 'r+');
    const stringContent = JSON.stringify(content);
    await truncateAsync(filePath);
    await writeFileAsync(fileDescriptor, stringContent);
    await closeAsync(fileDescriptor);
  } catch (err) {
    const baseMessage = 'Could not update existing file';
    switch (err.code) {
      case 'ENOENT':
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`, getEntityName(dir), file);
      case 'EACCES':
        throw new Error(`${baseMessage} due to lack of permission`);
      default:
        throw new Error(baseMessage);
    }
  }
}

export const dataService: IDataService = {
  create: createFile,
  delete: deleteFile,
  read: readFile,
  readAll: readDirectory,
  update: updateFile,
};
