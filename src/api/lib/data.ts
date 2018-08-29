import fs from 'fs';
import { promisify } from 'util';

import { environment } from '../config/config';
import {
  EntityExistsError,
  EntityNotFoundError,
} from './errors';
import { helpers } from './helpers';

const closeAsync = promisify(fs.close);
const openAsync = promisify(fs.open);
const readFileAsync = promisify(fs.readFile);
const truncateAsync = promisify(fs.truncate);
const unlinkAsync = promisify(fs.unlink);
const writeFileAsync = promisify(fs.writeFile);

interface IData {
  create: (dir: string, file: string, content: any) => Promise<void>;
  delete: (dir: string, file: string) => Promise<void>;
  read: (dir: string, file: string) => Promise<any>;
  update: (dir: string, file: string, content: any) => Promise<void>;
}

async function createFile(dir: string, file: string, content: any): Promise<void> {
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

async function deleteFile(dir: string, file: string): Promise<void> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    return await unlinkAsync(filePath);
  } catch (err) {
    const baseMessage = 'Could not delete file';
    switch (err.code) {
      case 'ENOENT':
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function readFile(dir: string, file: string): Promise<any> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    const user = await readFileAsync(filePath, 'utf8');
    return helpers.parseJSONToObject(user);
  } catch (err) {
    const baseMessage = 'Could not read file';
    switch (err.code) {
      case 'ENOENT':
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function updateFile(dir: string, file: string, content: any): Promise<void> {
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
        throw new EntityNotFoundError(`${baseMessage} as it may not exist`);
      case 'EACCES':
        throw new Error(`${baseMessage} due to lack of permission`);
      default:
        throw new Error(baseMessage);
    }
  }
}

export const data: IData = {
  create: createFile,
  delete: deleteFile,
  read: readFile,
  update: updateFile,
};
