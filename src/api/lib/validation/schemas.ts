import {
  IValidationSchema,
  validators,
} from '../services/validator.service';

export const tokenIdSchema: IValidationSchema = {
  id: validators.hasLength(20),
};
export const createTokenSchema: IValidationSchema = {
  password: validators.minLength(0),
  phone: validators.hasLength(10),
};
export const updateTokenSchema: IValidationSchema = {
  extends: validators.isBoolean(true),
  id: validators.hasLength(20),
};
export const userIdSchema: IValidationSchema = {
  id: validators.hasLength(10),
};
export const updateUserSchema: IValidationSchema = {
  firstName: validators.minLength(0),
  lastName: validators.minLength(0),
  password: validators.minLength(0),
  phone: validators.hasLength(10),
};
export const createUserSchema: IValidationSchema = {
  firstName: validators.minLength(0),
  lastName: validators.minLength(0),
  password: validators.minLength(0),
  phone: validators.hasLength(10),
  tosAgreement: validators.isBoolean(true),
};
