import { environment } from '../../config/config';
import {
  MISSING_OR_INVALID_FIELDS,
  MISSING_REQUIRED_FIELDS,
  PASSWORD_MISMATCH,
  TOKEN_CANNOT_BE_EXTENDED,
  TOKEN_CREATION_FAILED,
  TOKEN_DELETION_FAILED,
  TOKEN_DOES_NOT_EXIST,
  TOKEN_UPDATE_FAILED,
  USER_DOES_NOT_EXIST,
} from '../constants/messages';
import { EntityNotFoundError } from '../errors';
import { HTTPError } from '../errors/http-error';
import { helpers } from '../helpers';
import {
  IRequestData,
  IResponseData,
  IToken,
  ITokenDTO,
  ITokenRequestDTO,
  ITokenUpdateDTO,
  IUser,
} from '../interfaces';
import {
  dataService,
  Directory,
} from '../services/data.service';
import { validatorService } from '../services/validator.service';
import {
  createTokenSchema,
  tokenIdSchema,
  updateTokenSchema,
} from '../validation/schemas';
import { RequestHandler } from './types';

interface ITokensHandlers {
  [key: string]: RequestHandler<any, any>;
  DELETE: RequestHandler;
  GET: RequestHandler<{}, ITokenDTO>;
  PUT: RequestHandler<ITokenUpdateDTO>;
  POST: RequestHandler<ITokenRequestDTO, ITokenDTO>;
}

const tokensRouteRegExp = /^tokens\/(?<id>\w+)(?:\/\w+)*$/;

async function getToken(requestData: IRequestData): Promise<IResponseData<ITokenDTO>> {
  const tokensRouteRegExpExec = tokensRouteRegExp.exec(requestData.trimmedPath);
  const tokenValue = tokensRouteRegExpExec && tokensRouteRegExpExec.groups && tokensRouteRegExpExec.groups.id;
  const { id } = validatorService.validate({ id: tokenValue }, tokenIdSchema);
  if (id) {
    try {
      const token = await dataService.read<IToken>(Directory.Tokens, String(id));
      return {
        payload: token,
        statusCode: 200,
      };
    } catch {
      throw new HTTPError(404);
    }
  } else {
    throw new HTTPError(501);
  }
}

async function updateToken(requestData: IRequestData<ITokenUpdateDTO>): Promise<IResponseData> {
  const tokensRouteRegExpExec = tokensRouteRegExp.exec(requestData.trimmedPath);
  const tokenValue = tokensRouteRegExpExec && tokensRouteRegExpExec.groups && tokensRouteRegExpExec.groups.id;
  const {
    extend,
    id,
  } = validatorService.validate({
    ...requestData.payload,
    id: tokenValue,
  }, updateTokenSchema);

  if (id && extend) {
    try {
      const token = await dataService.read<IToken>(Directory.Tokens, id);
      if (token.expires > Date.now()) {
        token.expires = Date.now() + environment.tokenValidity;
        await dataService.update(Directory.Tokens, id, token);
        return {
          payload: token,
          statusCode: 200,
        };
      } else {
        throw new HTTPError(400, TOKEN_CANNOT_BE_EXTENDED);
      }
    } catch (err) {
      if (err instanceof HTTPError) {
        throw err;
      } else if (err instanceof EntityNotFoundError) {
        throw new HTTPError(404, TOKEN_DOES_NOT_EXIST);
      } else {
        throw new HTTPError(500, TOKEN_UPDATE_FAILED);
      }
    }
  } else {
    throw new HTTPError(400, MISSING_OR_INVALID_FIELDS);
  }
}

async function deleteToken(requestData: IRequestData): Promise<IResponseData> {
  const tokensRouteRegExpExec = tokensRouteRegExp.exec(requestData.trimmedPath);
  const tokenValue = tokensRouteRegExpExec && tokensRouteRegExpExec.groups && tokensRouteRegExpExec.groups.id;
  const { id } = validatorService.validate({ id: tokenValue }, tokenIdSchema);

  if (id) {
    try {
      await dataService.read<IToken>(Directory.Tokens, id);
      await dataService.delete(Directory.Tokens, id);
      return { statusCode: 204 };
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new HTTPError(404, TOKEN_DOES_NOT_EXIST);
      } else {
        throw new HTTPError(500, TOKEN_DELETION_FAILED);
      }
    }
  } else {
    throw new HTTPError(501);
  }
}

async function createToken(requestData: IRequestData<ITokenRequestDTO>): Promise<IResponseData<ITokenDTO>> {
  const {
    password,
    phone,
  } = validatorService.validate(requestData.payload, createTokenSchema);

  if (phone && password) {
    try {
      const user = await dataService.read<IUser>(Directory.Users, phone);
      const hashedPassword = helpers.hash(password);
      if (user.hashedPassword === hashedPassword) {
        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + environment.tokenValidity;
        const token: IToken = {
          expires,
          id: tokenId,
          phone,
        };
        await dataService.create(Directory.Tokens, tokenId, token);
        return {
          payload: token,
          statusCode: 201,
        };
      } else {
        throw new HTTPError(400, PASSWORD_MISMATCH);
      }
    } catch (err) {
      if (err instanceof HTTPError) {
        throw err;
      } else if (err instanceof EntityNotFoundError) {
        throw new HTTPError(404, USER_DOES_NOT_EXIST);
      } else {
        throw new HTTPError(500, TOKEN_CREATION_FAILED);
      }
    }
  } else {
    throw new HTTPError(400, MISSING_REQUIRED_FIELDS);
  }
}

export const tokensHandlers: ITokensHandlers = {
  DELETE: deleteToken,
  GET: getToken,
  POST: createToken,
  PUT: updateToken,
};
