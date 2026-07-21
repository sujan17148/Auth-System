import type { OAuthAccount } from '../../generated/prisma/client.js';
import type { OAuthProvider } from '../../generated/prisma/enums.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateOAuthAccount, IOAuthAccountRepository } from './repository.types.js';

class OAuthAccountRepository implements IOAuthAccountRepository {
  async findByProviderAccount(
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<OAuthAccount | null> {
    return prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
    });
  }

  async createOAuthAccount(data: CreateOAuthAccount): Promise<OAuthAccount> {
    return prisma.oAuthAccount.create({ data });
  }
}

export const oAuthRepository = new OAuthAccountRepository();
