import type { PasswordResetToken } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateResetTokenData, IPasswordResetRepository } from './repository.types.js';

class PasswordResetRepository implements IPasswordResetRepository {
  async upsertToken(data: CreateResetTokenData): Promise<PasswordResetToken> {
    return await prisma.passwordResetToken.upsert({
      where: { userId: data.userId },
      create: { userId: data.userId, tokenHash: data.tokenHash, expiresAt: data.expiresAt },
      update: { tokenHash: data.tokenHash, expiresAt: data.expiresAt },
    });
  }

  async getTokenByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return await prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });
  }

  async deleteToken(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }
}

export const passwordResetRepository = new PasswordResetRepository();
