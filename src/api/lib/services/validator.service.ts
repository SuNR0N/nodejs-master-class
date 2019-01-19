type Predicate = (input: any) => boolean;
type Validator<T = any> = (...inputs: T[]) => Predicate;

export interface IValidationSchema {
  [key: string]: Validator | Predicate;
}

interface IValidators {
  hasLength: Validator<number>;
  isArray: Validator<string>;
  isBoolean: Validator<boolean>;
  isIntegerInRange: Validator<number>;
  isMatch: Validator<RegExp>;
  isString: Predicate;
  minLength: Validator<number>;
}

interface IValidatorService {
  validate: <T = any>(data: T, schema: IValidationSchema) => T;
}

// tslint:disable:max-line-length
const hasLength: Validator<number> = (length) => (value: string) => isString(value) && value.trim().length === length;
const isArray: Validator<string> = (type) => (value: any[]) => Array.isArray(value) && type === undefined || value.every((item) => typeof item === type);
const isBoolean: Validator<boolean> = (expected: boolean) => (value) => typeof value === 'boolean' && expected === undefined || value === expected;
const isIntegerInRange: Validator<number> = (min, max) => (value) => value >= min && value <= max;
const isMatch: Validator<RegExp> = (expression) => (value: string) => isString(value) && expression.test(value);
const isString: Predicate = (value) => typeof value === 'string';
const minLength: Validator<number> = (length: number) => (value: string) => isString(value) && value.trim().length > length;
// tslint:enable:max-line-length

function validate<T = {}>(data: T, schema: IValidationSchema): T {
  const clonedData = JSON.parse(JSON.stringify(data));
  Object.entries(schema).forEach(([key, validator]) => {
    const value = clonedData[key];
    const val = validator(value);
    if (typeof val === 'boolean') {
      if (!val) {
        clonedData[key] = undefined;
      }
    } else if (!val(value)) {
      clonedData[key] = undefined;
    }
  });
  return clonedData;
}

export const validators: IValidators = {
  hasLength,
  isArray,
  isBoolean,
  isIntegerInRange,
  isMatch,
  isString,
  minLength,
};

export const validatorService: IValidatorService = {
  validate,
};
