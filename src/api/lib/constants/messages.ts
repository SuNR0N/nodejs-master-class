import { environment } from '../../config/config';
import { EntityNotFoundError } from '../errors';

export const CHECK_CREATION_FAILED = 'Could not create the new check';
export const CHECK_DELETION_FAILED = 'Could not delete the specified check';
export const CHECK_OF_USER_DOES_NOT_EXIST = 'Could not find the check on the user object';
export const CHECK_UPDATE_FAILED = 'Could not update the specified check';
// tslint:disable-next-line:max-line-length
export const ENTITY_DOES_NOT_EXIST = ({ type, id }: EntityNotFoundError) => `Entity '${type}' with ID = ${id} does not exist`;
export const MAX_CHECKS_REACHED = `The user already has the maximum number of checks (${environment.maxChecks})`;
export const MISSING_FIELDS_TO_UPDATE = 'Missing fields to update';
export const MISSING_OR_INVALID_FIELDS = 'Missing required field(s) or field(s) are invalid';
export const MISSING_REQUIRED_FIELDS = 'Missing required fields';
export const PASSWORD_HASH_FAILED = "Could not hash the user's password";
export const PASSWORD_MISMATCH = "Password did not match the specified user's store password";
export const TOKEN_CANNOT_BE_EXTENDED = 'The token has already expired and cannot be extended';
export const TOKEN_CREATION_FAILED = 'Could not create the new token';
export const TOKEN_DELETION_FAILED = 'Could not delete the specified token';
export const TOKEN_UPDATE_FAILED = 'Could not extend the specified token';
export const UNKNOWN_ERROR = 'An unknown error occurred';
export const USER_ALREADY_EXISTS = 'A user with that phone number already exists';
export const USER_CREATION_FAILED = 'Could not create the new user';
export const USER_DELETION_FAILED = 'Could not delete the specified user';
export const USER_UPDATE_FAILED = 'Could not update the specified user';
