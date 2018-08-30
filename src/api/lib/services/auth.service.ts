import { IncomingHttpHeaders } from 'http';

import { environment } from '../../config/config';
import { HTTPError } from '../errors';
import { tokenService } from './token.service';

interface IAuthService {
  checkAuthenticated: (headers: IncomingHttpHeaders, id: string) => Promise<boolean>;
}

async function checkAuthenticated(headers: IncomingHttpHeaders, id: string): Promise<boolean> {
  const token = headers[environment.tokenName];
  if (typeof token !== 'string') {
    throw new HTTPError(401);
  }
  const isTokenValid = await tokenService.verify(token, id);
  if (isTokenValid) {
    return true;
  } else {
    throw new HTTPError(403);
  }
}

export const authService: IAuthService = {
  checkAuthenticated,
};
