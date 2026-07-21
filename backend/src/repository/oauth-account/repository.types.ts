import type { OAuthAccount } from '../../generated/prisma/client.js';
import type { OAuthProvider } from '../../generated/prisma/enums.js';

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
