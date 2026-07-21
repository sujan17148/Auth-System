import type { PasswordResetToken } from '../../generated/prisma/client.js';

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
