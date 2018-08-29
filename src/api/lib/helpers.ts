import { createHmac } from 'crypto';

import { environment } from '../config/config';

interface IHelpers {
  hash: (value: string) => string | boolean;
  parseJSONToObject: (value: string) => any;
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
  hash,
  parseJSONToObject,
};
