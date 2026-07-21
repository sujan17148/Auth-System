import type { EmailVerificationToken } from '../../generated/prisma/client.js';

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
