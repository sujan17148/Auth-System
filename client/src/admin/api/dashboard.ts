import type { CurrentUser } from '@/features/auth/api/auth';
import { apiClient } from '@/services/apiClient';
import { mapApiResponse, type ApiResponse } from '@/types/api-mapper';

export type User = CurrentUser;

export interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string | null;
  lastActivity: string;
  expiresAt: string;
}

export type UserSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
};

export const fetchUserSummary = async (): Promise<UserSummary> => {
  const { data } = await apiClient.get<ApiResponse<UserSummary>>(`/admin/users/summary`);
  return mapApiResponse(data);
};

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<ApiResponse<User[]>>(`/admin/users`);
  return mapApiResponse(data);
};

export const fetchUserSession = async (userId: string): Promise<UserSession[]> => {
  const { data } = await apiClient.get<ApiResponse<UserSession[]>>(
    `/admin/users/${userId}/sessions`,
  );
  return mapApiResponse(data);
};

export interface ChangeUserStatusPayload {
  isActive: boolean;
  userId: string;
}

export const changeUserStatus = async ({ userId, isActive }: ChangeUserStatusPayload) => {
  await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
};
