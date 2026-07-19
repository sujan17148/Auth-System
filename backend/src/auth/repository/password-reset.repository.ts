import type { PasswordResetToken } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';

export interface CreateOtpData {
  otpHash: string;
  userId: string;
  expiresAt: Date;
}

export interface IPasswordResetRepository {
  upsertOtp(data: CreateOtpData): Promise<PasswordResetToken>;

  getOtpByUserId(userId: string): Promise<PasswordResetToken | null>;

  deleteOtp(userId: string): Promise<void>;
}

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
