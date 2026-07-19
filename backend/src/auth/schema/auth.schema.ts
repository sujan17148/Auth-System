import { z } from 'zod';

export const CreateUserSchema = z.object({
  firstName: z.string('First name is required').trim().min(1).max(50),
  lastName: z.string('Last name is required').trim().min(1).max(50),
  username: z.string('username is required').trim().min(1).max(50),
  email: z.email('Invalid email').trim(),
  password: z.string('Password is required').trim().min(6).max(50),
});

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1).max(50),
  password: z.string().trim().min(6).max(50),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().trim().min(6).max(50),
  newPassword: z.string().trim().min(6).max(50),
});

export const RequestPasswordResetSchema = z.object({
  email: z.email().trim(),
});

export const ResetPasswordSchema = z.object({
  email: z.email().trim(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'OTP must be exactly 4 digits'),
  newPassword: z.string().trim().min(6).max(50),
});

export const RequestEmailVerificationSchema = z.object({
  email: z.email().trim(),
});

export const VerifyEmailSchema = z.object({
  email: z.email().trim(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'OTP must be exactly 4 digits'),
});
