import type { PasswordResetToken } from '../../generated/prisma/client.js';

export interface CreateResetTokenData {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface IPasswordResetRepository {
  upsertToken(data: CreateResetTokenData): Promise<PasswordResetToken>;

  getTokenByHash(tokenHash: string): Promise<PasswordResetToken | null>;

  deleteToken(id: string): Promise<void>;
}
