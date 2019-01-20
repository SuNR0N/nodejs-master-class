import { environment } from '../../config/config';
import {
  EntityNotFoundError,
  FileOperationError,
} from '../errors';

export const CHECK_OF_USER_DOES_NOT_EXIST = 'Could not find the check on the user object';
// tslint:disable:max-line-length
export const ENTITY_OPERATION_FAILED = ({ type, id, operation }: FileOperationError) => `Could not ${operation} '${type}' with ID = ${id}`;
export const ENTITY_DOES_NOT_EXIST = ({ type, id }: EntityNotFoundError) => `Entity '${type}' with ID = ${id} does not exist`;
// tslint:enable:max-line-length
export const MAX_CHECKS_REACHED = `The user already has the maximum number of checks (${environment.maxChecks})`;
export const MISSING_FIELDS_TO_UPDATE = 'Missing fields to update';
export const MISSING_OR_INVALID_FIELDS = 'Missing required field(s) or field(s) are invalid';
export const MISSING_REQUIRED_FIELDS = 'Missing required fields';
export const PASSWORD_HASH_FAILED = "Could not hash the user's password";
export const PASSWORD_MISMATCH = "Password did not match the specified user's store password";
export const TOKEN_CANNOT_BE_EXTENDED = 'The token has already expired and cannot be extended';
export const UNKNOWN_ERROR = 'An unknown error occurred';
export const USER_ALREADY_EXISTS = 'A user with that phone number already exists';
