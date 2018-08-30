import { createHmac } from 'crypto';

import { environment } from '../config/config';

interface IHelpers {
  createRandomString: (len: number) => string;
  hash: (value: string) => string | boolean;
  parseJSONToObject: (value: string) => any;
}

// Create a string of random alphanumeric characters of a given length
function createRandomString(len: number): string {
  const pool = 'abcdefghijklmnopqrstuvwxyz1234567890';
  const poolLen = pool.length;
  let str = '';
  for (let i = 0; i <= len; i++) {
    const randomIndex = Math.floor(Math.random() * poolLen);
    str += pool[randomIndex];
  }
  return str;
}

// Create a SHA256 hash
function hash(value: string): string | boolean {
  if (typeof value === 'string' && value.length > 0) {
    const hashValue = createHmac('sha256', environment.hashingSecret)
      .update(value)
      .digest('hex');
    return hashValue;
  } else {
    return false;
  }
}

// Parse a JSON string to an object in all cases, without throwing
function parseJSONToObject(value: string): any {
  try {
    const object = JSON.parse(value);
    return object;
  } catch {
    return false;
  }
}

export const helpers: IHelpers = {
  createRandomString,
  hash,
  parseJSONToObject,
};
