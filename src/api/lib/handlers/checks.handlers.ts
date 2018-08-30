import { environment } from '../../config/config';
import {
  CHECK_CREATION_FAILED,
  MAX_CHECKS_REACHED,
  MISSING_REQUIRED_FIELDS,
  // MISSING_OR_INVALID_FIELDS,
  // MISSING_REQUIRED_FIELDS,
  // PASSWORD_MISMATCH,
  // TOKEN_CANNOT_BE_EXTENDED,
  // TOKEN_CREATION_FAILED,
  // TOKEN_DELETION_FAILED,
  // TOKEN_DOES_NOT_EXIST,
  // TOKEN_UPDATE_FAILED,
  // USER_DOES_NOT_EXIST,
} from '../constants/messages';
import { EntityNotFoundError } from '../errors';
import { HTTPError } from '../errors/http-error';
import { helpers } from '../helpers';
import {
  ICheckDTO,
  ICheckRequestDTO,
  IRequestData,
  IResponseData,
  IToken,
  IUser,
  // IToken,
  // ITokenDTO,
  // ITokenRequestDTO,
  // ITokenUpdateDTO,
} from '../interfaces';
// import { authService } from '../services/auth.service';
import {
  dataService,
  Directory,
} from '../services/data.service';
import {
  IValidationSchema,
  validators,
  validatorService,
} from '../services/validator.service';
import { RequestHandler } from './types';

interface IChecksHandlers {
  [key: string]: RequestHandler<any, any>;
  // DELETE: RequestHandler;
  // GET: RequestHandler<{}, ITokenDTO>;
  // PUT: RequestHandler<ITokenUpdateDTO>;
  POST: RequestHandler<ICheckRequestDTO, ICheckDTO>;
}

// const checksRouteRegExp = /^checks\/(?<id>\w+)(?:\/\w+)*$/;

// async function getToken(requestData: IRequestData): Promise<IResponseData<ITokenDTO>> {
//   const checksRouteRegExpExec = checksRouteRegExp.exec(requestData.trimmedPath);
//   let id = checksRouteRegExpExec && checksRouteRegExpExec.groups && checksRouteRegExpExec.groups.id || false;

//   if (typeof id === 'string' && id.trim().length === 20) {
//     id = id.trim();
//   }

//   if (id) {
//     try {
//       const token = await dataService.read('checks', String(id));
//       return {
//         payload: token,
//         statusCode: 200,
//       };
//     } catch {
//       throw new HTTPError(404);
//     }
//   } else {
//     throw new HTTPError(501);
//   }
// }

// async function updateToken(requestData: IRequestData<ITokenUpdateDTO>): Promise<IResponseData> {
//   const checksRouteRegExpExec = checksRouteRegExp.exec(requestData.trimmedPath);
//   const { extend = false } = requestData.payload;
//   let id = checksRouteRegExpExec && checksRouteRegExpExec.groups && checksRouteRegExpExec.groups.id || false;

//   if (typeof id === 'string' && id.trim().length === 20) {
//     id = id.trim();
//   }

//   if (id && extend) {
//     try {
//       const token = await dataService.read('checks', id);
//       if (token.expires > Date.now()) {
//         token.expires = Date.now() + environment.tokenValidity;
//         await dataService.update('checks', id, token);
//         return { statusCode: 200 };
//       } else {
//         throw new HTTPError(400, TOKEN_CANNOT_BE_EXTENDED);
//       }
//     } catch (err) {
//       if (err instanceof HTTPError) {
//         throw err;
//       } else if (err instanceof EntityNotFoundError) {
//         throw new HTTPError(404, TOKEN_DOES_NOT_EXIST);
//       } else {
//         throw new HTTPError(500, TOKEN_UPDATE_FAILED);
//       }
//     }
//   } else {
//     throw new HTTPError(400, MISSING_OR_INVALID_FIELDS);
//   }
// }

// async function deleteToken(requestData: IRequestData): Promise<IResponseData> {
//   const checksRouteRegExpExec = checksRouteRegExp.exec(requestData.trimmedPath);
//   let id = checksRouteRegExpExec && checksRouteRegExpExec.groups && checksRouteRegExpExec.groups.id || false;

//   if (typeof id === 'string' && id.trim().length === 20) {
//     id = id.trim();
//   }

//   if (id) {
//     try {
//       await dataService.read('checks', id);
//       await dataService.delete('checks', id);
//       return { statusCode: 204 };
//     } catch (err) {
//       if (err instanceof EntityNotFoundError) {
//         throw new HTTPError(404, TOKEN_DOES_NOT_EXIST);
//       } else {
//         throw new HTTPError(500, TOKEN_DELETION_FAILED);
//       }
//     }
//   } else {
//     throw new HTTPError(501);
//   }
// }

async function createCheck(requestData: IRequestData<ICheckRequestDTO>): Promise<IResponseData<ICheckDTO>> {
  const schema: IValidationSchema = {
    method: validators.isMatch(/^(DELETE|GET|PATCH|POST|PUT)$/),
    protocol: validators.isMatch(/^https?$/),
    successCodes: validators.isArray,
    timeoutSeconds: validators.isIntegerInRange(1, 5),
    url: validators.minLength(0),
  };
  const {
    protocol,
    url,
    method,
    successCodes,
    timeoutSeconds,
  } = validatorService.validate(requestData.payload, schema);

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const tokenId = requestData.headers[environment.tokenName] as string | undefined;
    try {
      const token = await dataService.read<IToken>(Directory.Tokens, tokenId!);
      const user = await dataService.read<IUser>(Directory.Users, token.phone);
      const checks = Array.isArray(user.checks) ? user.checks : [];
      if (checks.length < environment.maxChecks) {
        const checkId = helpers.createRandomString(20);
        const check: ICheckDTO = {
          id: checkId,
          protocol,
          successCodes,
          timeoutSeconds,
          url,
          userPhone: token.phone,
        };
        await dataService.create(Directory.Checks, checkId, check);
        checks.push(checkId);
        user.checks = checks;
        await dataService.update(Directory.Users, token.phone, user);
        return {
          payload: check,
          statusCode: 201,
        };
      } else {
        throw new HTTPError(400, MAX_CHECKS_REACHED);
      }
    } catch (err) {
      if (err instanceof HTTPError) {
        throw err;
      } else if (err instanceof EntityNotFoundError) {
        throw new HTTPError(403);
      } else {
        throw new HTTPError(500, CHECK_CREATION_FAILED);
      }
    }
  } else {
    throw new HTTPError(400, MISSING_REQUIRED_FIELDS);
  }
}

export const checksHandlers: IChecksHandlers = {
  // DELETE: deleteToken,
  // GET: getToken,
  POST: createCheck,
  // PUT: updateToken,
};
