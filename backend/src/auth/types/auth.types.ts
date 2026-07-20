import { z } from 'zod';
import type { Role, User } from '../../generated/prisma/client.js';

import type {
  ChangePasswordSchema,
  CreateUserSchema,
  LoginSchema,
  RequestEmailVerificationSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '../schema/auth.schema.js';

export interface TokenPayload {
  id: string;
  role: Role;
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
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export type RequestPasswordResetData = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type RequestEmailVerificationData = z.infer<typeof RequestEmailVerificationSchema>;
export type VerifyEmailData = z.infer<typeof VerifyEmailSchema>;
