import fs from 'fs';
import { promisify } from 'util';

import { environment } from '../config/config';

const closeAsync = promisify(fs.close);
const openAsync = promisify(fs.open);
const readFileAsync = promisify(fs.readFile);
const truncateAsync = promisify(fs.truncate);
const unlinkAsync = promisify(fs.unlink);
const writeFileAsync = promisify(fs.writeFile);

interface IData {
  create: (dir: string, file: string, data: any) => Promise<void>;
  delete: (dir: string, file: string) => Promise<void>;
  read: (dir: string, file: string) => Promise<string | undefined>;
  update: (dir: string, file: string, data:  any) => Promise<void>;
}

async function createFile(dir: string, file: string, data: any): Promise<void> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    const fileDescriptor = await openAsync(filePath, 'wx');
    const stringData = JSON.stringify(data);
    await writeFileAsync(fileDescriptor, stringData);
    return await closeAsync(fileDescriptor)
  } catch (err) {
    const baseMessage = 'Could not create new file';
    switch (err.code) {
      case 'ENOENT':
        throw new Error(`${baseMessage} as it may have a non-existing parent directory`);
      case 'EEXIST':
        throw new Error(`${baseMessage} as it may already exist`);
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
        throw new Error(`${baseMessage} as it may not exist`);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function readFile(dir: string, file: string): Promise<string | undefined> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    return await readFileAsync(filePath, 'utf8');
  } catch (err) {
    const baseMessage = 'Could not read file';
    switch (err.code) {
      case 'ENOENT':
        throw new Error(`${baseMessage} as it may not exist`);
      default:
        throw new Error(baseMessage);
    }
  }
}

async function updateFile(dir: string, file: string, data: any): Promise<void> {
  const filePath = `${environment.dataDir}/${dir}/${file}.json`;
  try {
    const fileDescriptor = await openAsync(filePath, 'r+');
    const stringData = JSON.stringify(data);
    await truncateAsync(filePath);
    await writeFileAsync(fileDescriptor, stringData);
    await closeAsync(fileDescriptor);
  } catch (err) {
    const baseMessage = 'Could not update existing file';
    switch (err.code) {
      case 'ENOENT':
        throw new Error(`${baseMessage} as it may not exist`);
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