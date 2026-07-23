export interface IVerificationTokenService {
  generateOTP(length?: number): string;

  generateSecureToken(bytes?: number): string;

  hashToken(token: string): string;

  verifyToken(token: string, hash: string): boolean;
}

import crypto from 'crypto';

class VerificationTokenService implements IVerificationTokenService {
  generateOTP(length = 4): string {
    return crypto
      .randomInt(0, 10 ** length)
      .toString()
      .padStart(length, '0');
  }

  generateSecureToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  verifyToken(token: string, hash: string): boolean {
    return this.hashToken(token) === hash;
  }
}

export const verificationTokenService = new VerificationTokenService();
