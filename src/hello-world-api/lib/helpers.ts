interface IHelpers {
  parseJSONToObject: (value: string) => any;
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
  parseJSONToObject,
};
