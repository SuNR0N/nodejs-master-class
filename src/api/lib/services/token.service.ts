import {
  dataService,
  Directory,
} from './data.service';

interface ITokenService {
  verify: (tokenId: string, userId: string) => Promise<boolean>;
}

async function verify(tokenId: string, userId: string): Promise<boolean> {
  try {
    const token = await dataService.read(Directory.Tokens, tokenId);
    return token.phone === userId && token.expires > Date.now();
  } catch {
    return false;
  }
}

export const tokenService: ITokenService = {
  verify,
};
