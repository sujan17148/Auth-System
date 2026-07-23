import type { CurrentUser } from '@/features/api/auth';
import { apiClient } from '@/services/apiClient';
import { mapApiResponse, type ApiResponse } from '@/types/api-mapper';
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters'),

  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),

  lastName: z
    .string()
    .trim()
    .max(50, 'Last name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
});

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().trim().min(6, 'Old password must be at least 6 characters'),

    newPassword: z
      .string()
      .trim()
      .min(6, 'New password must be at least 6 characters')
      .max(50, 'New password cannot exceed 50 characters'),

    confirmPassword: z.string().trim().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
export type ChangePasswordPayload = Omit<ChangePasswordFormData, 'confirmPassword'>;
export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

export const updateProfile = async (formdata: UpdateProfileFormData): Promise<CurrentUser> => {
  const payload = {
    ...(formdata.lastName && { lastName: formdata.lastName }),
    firstName: formdata.firstName,
    username: formdata.username,
  };
  const { data } = await apiClient.patch<ApiResponse<CurrentUser>>('auth/me', payload);
  return mapApiResponse(data);
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await apiClient.patch<ApiResponse<CurrentUser>>('auth/change-password', payload);
};
