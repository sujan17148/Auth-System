import type { PasswordResetToken } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateOtpData, IPasswordResetRepository } from './repository.types.js';

class PasswordResetRepository implements IPasswordResetRepository {
  async upsertOtp(data: CreateOtpData): Promise<PasswordResetToken> {
    return await prisma.passwordResetToken.upsert({
      where: { userId: data.userId },
      create: { userId: data.userId, otpHash: data.otpHash, expiresAt: data.expiresAt },
      update: { otpHash: data.otpHash, expiresAt: data.expiresAt },
    });
  }

  async getOtpByUserId(userId: string): Promise<PasswordResetToken | null> {
    return await prisma.passwordResetToken.findUnique({
      where: { userId },
    });
  }

  async deleteOtp(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }
}

export const passwordResetRepository = new PasswordResetRepository();
