import { environment } from '../../config/config';
import {
  EntityExistsError,
  EntityNotFoundError,
  FileOperationError,
} from '../errors';
import { helpers } from '../helpers';
import { Directory } from '../models/directory';
import {
  closeAsync,
  openAsync,
  readdirAsync,
  readFileAsync,
  truncateAsync,
  unlinkAsync,
  writeFileAsync,
} from '../utils/async.utils';

interface IDataService {
  create: (dir: Directory, file: string, content: any) => Promise<void>;
  delete: (dir: Directory, file: string) => Promise<void>;
  read: <T = any>(dir: Directory, file: string) => Promise<T>;
  list: <T = any>(dir: Directory) => Promise<T[]>;
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
      case 'EEXIST':
        throw new EntityExistsError(`${baseMessage} as it may already exist`);
      default:
        throw new FileOperationError(baseMessage, getEntityName(dir), file, 'create');
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
        throw new FileOperationError(baseMessage, getEntityName(dir), file, 'delete');
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
        throw new FileOperationError(baseMessage, getEntityName(dir), file, 'read');
    }
  }
}

async function listDirectory<T = any>(dir: Directory): Promise<T[]> {
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
      default:
        throw new FileOperationError(baseMessage, getEntityName(dir), file, 'update');
    }
  }
}

export const dataService: IDataService = {
  create: createFile,
  delete: deleteFile,
  list: listDirectory,
  read: readFile,
  update: updateFile,
};
