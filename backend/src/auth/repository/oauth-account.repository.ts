import type { OAuthAccount } from '../../generated/prisma/client.js';
import type { OAuthProvider } from '../../generated/prisma/enums.js';
import { prisma } from '../../lib/prisma.js';

export type CreateOAuthAccount = {
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
};

export interface IOAuthAccountRepository {
  findByProviderAccount(
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<OAuthAccount | null>;

  createOAuthAccount(data: CreateOAuthAccount): Promise<OAuthAccount>;
}

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
