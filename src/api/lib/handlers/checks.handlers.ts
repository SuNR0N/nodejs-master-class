import { environment } from '../../config/config';
import {
  CHECK_CREATION_FAILED,
  CHECK_DELETION_FAILED,
  CHECK_DOES_NOT_EXIST,
  CHECK_UPDATE_FAILED,
  MAX_CHECKS_REACHED,
  MISSING_FIELDS_TO_UPDATE,
  MISSING_REQUIRED_FIELDS,
} from '../constants/messages';
import { EntityNotFoundError } from '../errors';
import { HTTPError } from '../errors/http-error';
import { helpers } from '../helpers';
import {
  ICheck,
  ICheckDTO,
  ICheckRequestDTO,
  IRequestData,
  IResponseData,
  IToken,
  IUser,
} from '../interfaces';
import { authService } from '../services/auth.service';
import {
  dataService,
  Directory,
} from '../services/data.service';
import { validatorService } from '../services/validator.service';
import {
  checkIdSchema,
  createCheckSchema,
  updateCheckSchema,
} from '../validation/schemas';
import { RequestHandler } from './types';

interface IChecksHandlers {
  [key: string]: RequestHandler<any, any>;
  DELETE: RequestHandler;
  GET: RequestHandler<{}, ICheckDTO>;
  PATCH: RequestHandler<Partial<ICheckDTO>>;
  POST: RequestHandler<ICheckRequestDTO, ICheckDTO>;
}

const checksRouteRegExp = /^checks\/(?<id>\w+)(?:\/\w+)*$/;

async function getCheck(requestData: IRequestData): Promise<IResponseData<ICheckDTO>> {
  const checksRouteRegExpExec = checksRouteRegExp.exec(requestData.trimmedPath);
  const checkId = checksRouteRegExpExec && checksRouteRegExpExec.groups && checksRouteRegExpExec.groups.id || false;
  const { id } = validatorService.validate({ id: checkId }, checkIdSchema);

  if (id) {
    try {
      const check = await dataService.read<ICheck>(Directory.Checks, String(id));
      await authService.checkAuthenticated(requestData.headers, check.userPhone);
      return {
        payload: check,
        statusCode: 200,
      };
    } catch (err) {
      if (err instanceof HTTPError) {
        throw err;
      } else {
        throw new HTTPError(404, CHECK_DOES_NOT_EXIST);
      }
    }
  } else {
    throw new HTTPError(501);
  }
}

async function updateCheck(requestData: IRequestData<Partial<ICheckDTO>>): Promise<IResponseData> {
  const checksRouteRegExpExec = checksRouteRegExp.exec(requestData.trimmedPath);
  const checkId = checksRouteRegExpExec && checksRouteRegExpExec.groups && checksRouteRegExpExec.groups.id;
  const {
    id,
    method,
    protocol,
    successCodes,
    timeoutSeconds,
    url,
  } = validatorService.validate({
    ...requestData.payload,
    id: checkId,
  }, updateCheckSchema);

  if (id) {
    if (method || protocol || successCodes || timeoutSeconds || url) {
      try {
        const check = await dataService.read<ICheck>(Directory.Checks, String(checkId));
        await authService.checkAuthenticated(requestData.headers, check.userPhone);
        check.method = method !== undefined ? method : check.method;
        check.protocol = protocol !== undefined ? protocol : check.protocol;
        check.successCodes = successCodes !== undefined ? successCodes : check.successCodes;
        check.timeoutSeconds = timeoutSeconds !== undefined ? timeoutSeconds : check.timeoutSeconds;
        check.url = url !== undefined ? url : check.url;
        await dataService.update(Directory.Checks, String(id), check);
        return {
          payload: check,
          statusCode: 200,
        };
      } catch (err) {
        if (err instanceof HTTPError) {
          throw err;
        } else if (err instanceof EntityNotFoundError) {
          throw new HTTPError(404, CHECK_DOES_NOT_EXIST);
        } else {
          throw new HTTPError(500, CHECK_UPDATE_FAILED);
        }
      }
    } else {
      throw new HTTPError(400, MISSING_FIELDS_TO_UPDATE);
    }
  } else {
    throw new HTTPError(501);
  }
}

async function deleteCheck(requestData: IRequestData): Promise<IResponseData> {
  const checksRouteRegExpExec = checksRouteRegExp.exec(requestData.trimmedPath);
  const checkId = checksRouteRegExpExec && checksRouteRegExpExec.groups && checksRouteRegExpExec.groups.id || false;
  const { id } = validatorService.validate({ id: checkId }, checkIdSchema);

  if (id) {
    try {
      const check = await dataService.read<ICheck>(Directory.Checks, String(id));
      await authService.checkAuthenticated(requestData.headers, check.userPhone);
      await dataService.delete(Directory.Checks, String(id));
      const user = await dataService.read<IUser>(Directory.Users, String(check.userPhone));
      const deletedCheckIndex = user.checks!.indexOf(check.id);
      if (deletedCheckIndex !== -1) {
        user.checks!.splice(deletedCheckIndex, 1);
        await dataService.update(Directory.Users, String(check.userPhone), user);
      }
      return { statusCode: 204 };
    } catch (err) {
      if (err instanceof HTTPError) {
        throw err;
      } else if (err instanceof EntityNotFoundError) {
        throw new HTTPError(404, CHECK_DOES_NOT_EXIST);
      } else {
        throw new HTTPError(500, CHECK_DELETION_FAILED);
      }
    }
  } else {
    throw new HTTPError(501);
  }
}

async function createCheck(requestData: IRequestData<ICheckRequestDTO>): Promise<IResponseData<ICheckDTO>> {
  const {
    protocol,
    url,
    method,
    successCodes,
    timeoutSeconds,
  } = validatorService.validate(requestData.payload, createCheckSchema);

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
          method,
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
  DELETE: deleteCheck,
  GET: getCheck,
  PATCH: updateCheck,
  POST: createCheck,
};
