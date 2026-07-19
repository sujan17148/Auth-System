import type { EmailVerificationToken } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';

export interface CreateOtpData {
  otpHash: string;
  userId: string;
  expiresAt: Date;
}

export interface IEmailVerificationRepository {
  upsertOtp(data: CreateOtpData): Promise<EmailVerificationToken>;

  getOtpByUserId(userId: string): Promise<EmailVerificationToken | null>;

  deleteOtp(userId: string): Promise<void>;
}

class EmailVerificationRepository implements IEmailVerificationRepository {
  async upsertOtp(data: CreateOtpData): Promise<EmailVerificationToken> {
    return await prisma.emailVerificationToken.upsert({
      where: { userId: data.userId },
      create: { userId: data.userId, otpHash: data.otpHash, expiresAt: data.expiresAt },
      update: { otpHash: data.otpHash, expiresAt: data.expiresAt },
    });
  }

  async getOtpByUserId(userId: string): Promise<EmailVerificationToken | null> {
    return await prisma.emailVerificationToken.findUnique({
      where: { userId },
    });
  }

  async deleteOtp(userId: string): Promise<void> {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });
  }
}

export const emailVerificationRepository = new EmailVerificationRepository();
