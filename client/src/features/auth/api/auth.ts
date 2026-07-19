import { apiClient } from '@/services/apiClient';
import { publicApiClient } from '@/services/publicApiClient';
import { mapApiResponse, type ApiResponse } from '@/types/api-mapper';
import { z } from 'zod';

let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const removeAccessToken = (): void => {
  accessToken = null;
};

export interface LoginResponse {
  accessToken: string;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LoginSchema = z.object({
  identifier: z.string('Username or email is required').trim().min(5),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterUserSchema = z
  .object({
    firstName: z
      .string({ error: 'First name is required' })
      .trim()
      .min(2, 'First name must be at least 2 characters'),

    lastName: z
      .string({ error: 'Last name is required' })
      .trim()
      .min(2, 'Last name must be at least 2 characters'),

    email: z.string({ error: 'Email is required' }).email('Please enter a valid email'),

    username: z
      .string({ error: 'Username is required' })
      .trim()
      .min(5, 'Username must be at least 5 characters'),

    password: z
      .string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters'),

    confirmPassword: z
      .string({ error: 'Confirm password is required' })
      .min(8, 'Confirm password must be at least 8 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const VerifyEmailSchema = z.object({
  email: z.string({ error: 'Email is required' }).email('Please enter a valid email'),

  otp: z
    .string({ error: 'Verification code is required' })
    .trim()
    .length(4, 'Verification code must be 4 digits'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string({ error: 'Email is required' }).email('Please enter a valid email'),
});

export const ResetPasswordSchema = z
  .object({
    email: z.string({ error: 'Email is required' }).email('Please enter a valid email'),

    otp: z
      .string({ error: 'Verification code is required' })
      .trim()
      .length(4, 'Verification code must be 4 digits'),

    newPassword: z
      .string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters'),

    confirmPassword: z
      .string({ error: 'Confirm password is required' })
      .min(8, 'Confirm password must be at least 8 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type LoginPayload = z.infer<typeof LoginSchema>;
export type RegisterUserPayload = z.infer<typeof RegisterUserSchema>;
export type VerifyEmailPayload = z.infer<typeof VerifyEmailSchema>;
export type RequestEmailVerificationPayload = Omit<VerifyEmailPayload, 'otp'>;
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;
export type RequestResetPasswordPayload = Pick<ResetPasswordPayload, 'email'>;

export const login = async (payload: LoginPayload): Promise<string> => {
  const { data } = await publicApiClient.post<ApiResponse<LoginResponse>>('auth/login', payload);
  const accessToken = mapApiResponse(data).accessToken;
  setAccessToken(accessToken);
  return accessToken;
};

export const refreshAccessToken = async (): Promise<string> => {
  const { data } = await publicApiClient.post<ApiResponse<LoginResponse>>('auth/token/refresh');
  return mapApiResponse(data).accessToken;
};

export const registerUser = async (payload: RegisterUserPayload): Promise<CurrentUser> => {
  const { data } = await publicApiClient.post<ApiResponse<CurrentUser>>('auth/register', payload);
  return mapApiResponse(data);
};

export const requestVerifyEmail = async (
  payload: RequestEmailVerificationPayload,
): Promise<void> => {
  await apiClient.post<ApiResponse<CurrentUser>>('auth/request-verify-email', payload);
};

export const verifyEmail = async (payload: VerifyEmailPayload): Promise<CurrentUser> => {
  const { data } = await apiClient.post<ApiResponse<CurrentUser>>('auth/verify-email', payload);
  return mapApiResponse(data);
};

export const requestPasswordReset = async (payload: RequestResetPasswordPayload): Promise<void> => {
  await apiClient.post<ApiResponse<CurrentUser>>('auth/request-password-reset', payload);
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await apiClient.post<ApiResponse<CurrentUser>>('auth/reset-password', payload);
};
