import {
  IValidationSchema,
  validators,
} from '../services/validator.service';

export const tokenIdSchema: IValidationSchema = {
  id: validators.hasLength(20),
};
export const createTokenSchema: IValidationSchema = {
  password: validators.minLength(1),
  phone: [
    validators.minLength(10),
    validators.maxLength(15),
  ],
};
export const updateTokenSchema: IValidationSchema = {
  extends: validators.isBoolean(true),
  id: validators.hasLength(20),
};
export const userIdSchema: IValidationSchema = {
  id: [
    validators.minLength(10),
    validators.maxLength(15),
  ],
};
export const updateUserSchema: IValidationSchema = {
  firstName: validators.minLength(1),
  lastName: validators.minLength(1),
  password: validators.minLength(1),
  phone: [
    validators.minLength(10),
    validators.maxLength(15),
  ],
};
export const createUserSchema: IValidationSchema = {
  firstName: validators.minLength(1),
  lastName: validators.minLength(1),
  password: validators.minLength(1),
  phone: [
    validators.minLength(10),
    validators.maxLength(15),
  ],
  tosAgreement: validators.isBoolean(true),
};
export const checkIdSchema: IValidationSchema = {
  id: validators.hasLength(20),
};
export const updateCheckSchema: IValidationSchema = {
  id: validators.hasLength(20),
  method: validators.isMatch(/^(DELETE|GET|PATCH|POST|PUT)$/),
  protocol: validators.isMatch(/^https?$/),
  successCodes: validators.isArray('number'),
  timeoutSeconds: validators.isIntegerInRange(1, 5),
  url: validators.minLength(1),
};
export const createCheckSchema: IValidationSchema = {
  method: validators.isMatch(/^(DELETE|GET|PATCH|POST|PUT)$/),
  protocol: validators.isMatch(/^https?$/),
  successCodes: validators.isArray('number'),
  timeoutSeconds: validators.isIntegerInRange(1, 5),
  url: validators.minLength(1),
};
export const validCheckSchema: IValidationSchema = {
  id: validators.hasLength(20),
  lastChecked: validators.isNumber,
  method: validators.isMatch(/^(DELETE|GET|PATCH|POST|PUT)$/),
  protocol: validators.isMatch(/^https?$/),
  state: validators.isMatch(/^(UP|DOWN)$/),
  successCodes: [
    validators.isArray('number'),
    validators.isEmpty(false),
  ],
  timeoutSeconds: validators.isIntegerInRange(1, 5),
  url: validators.minLength(1),
};
