import type { SafeUserData } from '../../auth/types/auth.types.js';
import { Role } from '../../generated/prisma/client.js';
import type { SafeSession } from '../../repository/session/repository.types.js';
import { sessionRepository } from '../../repository/session/session.repository.js';
import type { UsersSummary } from '../../repository/users/reposiory.types.js';
import { userRepository } from '../../repository/users/user.repository.js';
import { ForbiddenError, NotFoundError } from '../../utility/apiError.js';

export interface IAdminUserService {
  getAllUsers(): Promise<SafeUserData[]>;

  getUsersSummary(): Promise<UsersSummary>;

  getUserSessions(userId: string): Promise<SafeSession[]>;

  changeUserActiveStatus(userId: string, isActive: boolean): Promise<SafeUserData>;
}

class AdminUserService implements IAdminUserService {
  async getAllUsers(): Promise<SafeUserData[]> {
    return await userRepository.getAllUsers();
  }

  async getUsersSummary(): Promise<UsersSummary> {
    return await userRepository.getUsersSummary();
  }

  async getUserSessions(userId: string): Promise<SafeSession[]> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return await sessionRepository.getUserSessions(userId);
  }

  async changeUserActiveStatus(userId: string, isActive: boolean): Promise<SafeUserData> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (user.role === Role.ADMIN) {
      throw new ForbiddenError('Admin accounts cannot be modified.');
    }

    return await userRepository.changeUserActiveStatus(userId, isActive);
  }
}

export const adminUserService = new AdminUserService();
