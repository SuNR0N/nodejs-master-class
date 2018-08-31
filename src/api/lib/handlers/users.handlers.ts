import {
  MISSING_FIELDS_TO_UPDATE,
  MISSING_REQUIRED_FIELDS,
  PASSWORD_HASH_FAILED,
  USER_ALREADY_EXISTS,
  USER_CREATION_FAILED,
  USER_DELETION_FAILED,
  USER_DOES_NOT_EXIST,
  USER_UPDATE_FAILED,
} from '../constants/messages';
import { EntityNotFoundError } from '../errors';
import { HTTPError } from '../errors/http-error';
import { helpers } from '../helpers';
import {
  IRequestData,
  IResponseData,
  IUser,
  IUserDTO,
} from '../interfaces';
import { authService } from '../services/auth.service';
import {
  dataService,
  Directory,
} from '../services/data.service';
import { validatorService } from '../services/validator.service';
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../validation/schemas';
import { RequestHandler } from './types';

interface IUsersHandlers {
  [key: string]: RequestHandler<any, any>;
  DELETE: RequestHandler;
  GET: RequestHandler<{}, Partial<IUserDTO>>;
  PATCH: RequestHandler<Partial<IUserDTO>>;
  POST: RequestHandler<IUserDTO>;
}

const usersRouteRegExp = /^users\/(?<id>\d*)(?:\/\w+)*$/;

async function getUser(requestData: IRequestData): Promise<IResponseData<Partial<IUserDTO>>> {
  const usersRouteRegExpExec = usersRouteRegExp.exec(requestData.trimmedPath);
  const id = usersRouteRegExpExec && usersRouteRegExpExec.groups && usersRouteRegExpExec.groups.id;
  const { phone } = validatorService.validate({ phone: id }, userIdSchema);

  if (phone) {
    await authService.checkAuthenticated(requestData.headers, phone);
    try {
      const user = await dataService.read<IUser>(Directory.Users, String(phone));
      delete user.hashedPassword;
      return {
        payload: user,
        statusCode: 200,
      };
    } catch {
      throw new HTTPError(404);
    }
  } else {
    throw new HTTPError(501);
  }
}

async function updateUser(requestData: IRequestData<Partial<IUserDTO>>): Promise<IResponseData> {
  const usersRouteRegExpExec = usersRouteRegExp.exec(requestData.trimmedPath);
  const id = usersRouteRegExpExec && usersRouteRegExpExec.groups && usersRouteRegExpExec.groups.id;
  const {
    firstName,
    lastName,
    password,
    phone,
  } = validatorService.validate({
    ...requestData.payload,
    phone: id,
  }, updateUserSchema);

  if (phone) {
    await authService.checkAuthenticated(requestData.headers, phone);
    if (firstName || lastName || password) {
      try {
        const user = await dataService.read<IUser>(Directory.Users, String(phone));
        if (firstName) {
          user.firstName = firstName;
        }
        if (lastName) {
          user.lastName = lastName;
        }
        if (password) {
          user.hashedPassword = helpers.hash(password) as string;
        }
        await dataService.update(Directory.Users, String(phone), user);
        return { statusCode: 200 };
      } catch (err) {
        if (err instanceof EntityNotFoundError) {
          throw new HTTPError(404, USER_DOES_NOT_EXIST);
        } else {
          throw new HTTPError(500, USER_UPDATE_FAILED);
        }
      }
    } else {
      throw new HTTPError(400, MISSING_FIELDS_TO_UPDATE);
    }
  } else {
    throw new HTTPError(501);
  }
}

async function deleteUser(requestData: IRequestData): Promise<IResponseData> {
  const usersRouteRegExpExec = usersRouteRegExp.exec(requestData.trimmedPath);
  const id = usersRouteRegExpExec && usersRouteRegExpExec.groups && usersRouteRegExpExec.groups.id;
  const { phone } = validatorService.validate({ phone: id }, userIdSchema);
  if (phone) {
    await authService.checkAuthenticated(requestData.headers, phone);
    try {
      await dataService.read<IUser>(Directory.Users, String(phone));
      await dataService.delete(Directory.Users, String(phone));
      return { statusCode: 204 };
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new HTTPError(404, USER_DOES_NOT_EXIST);
      } else {
        throw new HTTPError(500, USER_DELETION_FAILED);
      }
    }
  } else {
    throw new HTTPError(400, MISSING_REQUIRED_FIELDS);
  }
}

async function createUser(requestData: IRequestData<IUserDTO>): Promise<IResponseData> {
  const {
    firstName,
    lastName,
    password,
    phone,
    tosAgreement,
  } = validatorService.validate(requestData.payload, createUserSchema);

  if (firstName && lastName && phone && password && tosAgreement) {
    try {
      await dataService.read<IUser>(Directory.Users, phone);
      throw new HTTPError(409, USER_ALREADY_EXISTS);
    } catch (err) {
      if (err instanceof HTTPError) {
        throw err;
      }
      const hashedPassword = helpers.hash(password);
      if (hashedPassword) {
        const user = {
          firstName,
          hashedPassword,
          lastName,
          phone,
          tosAgreement,
        };
        try {
          await dataService.create(Directory.Users, phone, user);
          return { statusCode: 201 };
        } catch {
          throw new HTTPError(500, USER_CREATION_FAILED);
        }
      } else {
        throw new HTTPError(500, PASSWORD_HASH_FAILED);
      }
    }
  } else {
    throw new HTTPError(400, MISSING_REQUIRED_FIELDS);
  }
}

export const usersHandlers: IUsersHandlers = {
  DELETE: deleteUser,
  GET: getUser,
  PATCH: updateUser,
  POST: createUser,
};