type Predicate = (input: any) => boolean;
type Validator<T = any> = (...inputs: T[]) => Predicate;

export interface IValidationSchema {
  [key: string]: Validator | Predicate;
}

interface IValidators {
  hasLength: Validator<number>;
  isArray: Predicate;
  isIntegerInRange: Validator<number>;
  isMatch: Validator<RegExp>;
  isString: Predicate;
  minLength: Validator<number>;
}

interface IValidatorService {
  validate: <T = any>(data: T, schema: IValidationSchema) => T;
}

const hasLength: Validator<number> = (length) => (value: string) => isString(value) && value.trim().length === length;
const isArray: Predicate = (value) => Array.isArray(value);
const isIntegerInRange: Validator<number> = (min, max) => (value) => value >= min && value <= max;
const isMatch: Validator<RegExp> = (expression) => (value: string) => isString(value) && expression.test(value);
const isString: Predicate = (value) => typeof value === 'string';
// tslint:disable-next-line:max-line-length
const minLength: Validator<number> = (length: number) => (value: string) => isString(value) && value.trim().length > length;

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
  isIntegerInRange,
  isMatch,
  isString,
  minLength,
};

export const validatorService: IValidatorService = {
  validate,
};
