import type {
  CreateUserRepositoryData,
  SafeUserData,
  UserWithPasswordData,
} from '../../auth/types/auth.types.js';
import { prisma } from '../../lib/prisma.js';
import type { IUserRepository, UsersSummary } from './reposiory.types.js';

export const safeUserOmit = {
  passwordHash: true,
} as const;

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

  async changeUsername(id: string, username: string): Promise<SafeUserData> {
    return prisma.user.update({
      where: { id },
      data: { username },
      omit: safeUserOmit,
    });
  }

  async getAllUsers(): Promise<SafeUserData[]> {
    return await prisma.user.findMany({
      omit: safeUserOmit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsersSummary(): Promise<UsersSummary> {
    const [totalUsers, activeUsers, inactiveUsers, verifiedUsers, unverifiedUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { emailVerified: true } }),
        prisma.user.count({ where: { emailVerified: false } }),
      ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
    };
  }

  async changeUserActiveStatus(id: string, isActive: boolean): Promise<SafeUserData> {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      omit: safeUserOmit,
    });
  }
}

export const userRepository = new UserRepository();
