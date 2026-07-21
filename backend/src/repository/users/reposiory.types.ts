import type {
  CreateUserRepositoryData,
  SafeUserData,
  UserWithPasswordData,
} from '../../auth/types/auth.types.js';

export interface UsersSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

export interface IUserRepository {
  getUserById(id: string): Promise<SafeUserData | null>;
  getUserWithPasswordById(id: string): Promise<UserWithPasswordData | null>;
  getUserByEmail(email: string): Promise<SafeUserData | null>;
  getUserByUsername(username: string): Promise<SafeUserData | null>;
  getUserByIdentifier(identifier: string): Promise<UserWithPasswordData | null>;

  getAllUsers(): Promise<SafeUserData[]>;
  getUsersSummary(): Promise<UsersSummary>;

  createUser(data: CreateUserRepositoryData): Promise<SafeUserData>;
  updatePassword(id: string, passwordHash: string): Promise<SafeUserData>;
  verifyEmail(id: string): Promise<SafeUserData>;
  changeUsername(id: string, username: string): Promise<SafeUserData>;

  changeUserActiveStatus(id: string, isActive: boolean): Promise<SafeUserData>;
}
