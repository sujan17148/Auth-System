import { z } from 'zod';
import type { Role, User } from '../../generated/prisma/client.js';

import type {
  ChangePasswordSchema,
  CreateUserSchema,
  LoginSchema,
  RequestEmailVerificationSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  VerifyEmailSchema,
} from '../schema/auth.schema.js';

export interface TokenPayload {
  id: string;
  role: Role;
  sessionId: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface LoginServiceResponse {
  accessToken: string;
  refreshToken: string;
}
export type UserWithPasswordData = User;
export type SafeUserData = Omit<User, 'passwordHash'>;
export type CreateUserData = z.infer<typeof CreateUserSchema>;

export type CreateUserRepositoryData = Omit<CreateUserData, 'password'> & {
  passwordHash: string | null;
  emailVerified?: boolean;
};

export type LoginData = z.infer<typeof LoginSchema>;

export interface LoginServiceData extends LoginData {
  ipAddress: string;
  userAgent: string;
}

export type VerifyEmailData = z.infer<typeof VerifyEmailSchema>;
export type RequestEmailVerificationData = z.infer<typeof RequestEmailVerificationSchema>;

export interface EmailVerificationData {
  otpHash: string;
  attempts: string;
  maxAttempts: string;
}

export type RequestPasswordResetData = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

export type updateProfileData = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
