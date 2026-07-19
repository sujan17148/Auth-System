import { prisma } from '../../lib/prisma.js';
import type {
  CreateUserRepositoryData,
  SafeUserData,
  UserWithPasswordData,
} from '../types/auth.types.js';

export const safeUserOmit = {
  passwordHash: true,
} as const;

export interface IUserRepository {
  getUserById(id: string): Promise<SafeUserData | null>;
  getUserWithPasswordById(id: string): Promise<UserWithPasswordData | null>;
  getUserByEmail(email: string): Promise<SafeUserData | null>;
  getUserByUsername(username: string): Promise<SafeUserData | null>;
  getUserByIdentifier(identifier: string): Promise<UserWithPasswordData | null>;

  createUser(data: CreateUserRepositoryData): Promise<SafeUserData>;
  updatePassword(id: string, passwordHash: string): Promise<SafeUserData>;
  verifyEmail(id: string): Promise<SafeUserData>;
  changeEmail(id: string, email: string): Promise<SafeUserData>;
  changeUsername(id: string, username: string): Promise<SafeUserData>;
  deactivateUser(id: string): Promise<SafeUserData>;
  activateUser(id: string): Promise<SafeUserData>;
}

class UserRepository implements IUserRepository {
  async getUserById(id: string): Promise<SafeUserData | null> {
    return prisma.user.findUnique({
      where: { id },
      omit: safeUserOmit,
    });
  }

  async getUserWithPasswordById(id: string): Promise<UserWithPasswordData | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<SafeUserData | null> {
    return prisma.user.findUnique({
      where: { email },
      omit: safeUserOmit,
    });
  }

  async getUserByUsername(username: string): Promise<SafeUserData | null> {
    return prisma.user.findUnique({
      where: { username },
      omit: safeUserOmit,
    });
  }

  async getUserByIdentifier(identifier: string): Promise<UserWithPasswordData | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async createUser(data: CreateUserRepositoryData): Promise<SafeUserData> {
    return prisma.user.create({
      data,
      omit: safeUserOmit,
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
      omit: safeUserOmit,
    });
  }

  async verifyEmail(id: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: true },
      omit: safeUserOmit,
    });
  }
  async changeEmail(id: string, email: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { email },
      omit: safeUserOmit,
    });
  }

  async changeUsername(id: string, username: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { username },
      omit: safeUserOmit,
    });
  }
  async deactivateUser(id: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      omit: safeUserOmit,
    });
  }

  async activateUser(id: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { isActive: true },
      omit: safeUserOmit,
    });
  }
}

export const userRepository = new UserRepository();
