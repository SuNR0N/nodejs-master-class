import { IToken } from '../interfaces/token';
import { Directory } from '../models/directory';
import { dataService } from './data.service';

interface ITokenService {
  verify: (tokenId: string, userId: string) => Promise<boolean>;
}

async function verify(tokenId: string, userId: string): Promise<boolean> {
  try {
    const token = await dataService.read<IToken>(Directory.Tokens, tokenId);
    return token.phone === userId && token.expires > Date.now();
  } catch (err) {
    return false;
  }
}

export const tokenService: ITokenService = {
  verify,
};
