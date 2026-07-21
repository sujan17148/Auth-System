import type { SafeUserData } from '../../auth/types/auth.types.js';
import type { Session, User } from '../../generated/prisma/client.js';

export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

export interface AdminUserService {
  getAllUsers(): Promise<SafeUserData[]>;

  getUsersSummary(): Promise<UserSummary>;

  getUserSessions(userId: string): Promise<Session[]>;

  changeUserActiveStatus(userId: string, isActive: boolean): Promise<User>;
}
