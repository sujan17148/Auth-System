import { redisClient } from '../../config/redis.js';
import type { SafeUserData } from '../types/auth.types.js';

export interface IUserCacheService {
  get(userId: string): Promise<SafeUserData | null>;
  set(user: SafeUserData): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

class UserCacheService implements IUserCacheService {
  private getUserCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  async get(userId: string): Promise<SafeUserData | null> {
    const cached = await redisClient.get(this.getUserCacheKey(userId));

    if (!cached) return null;

    return JSON.parse(cached) as SafeUserData;
  }

  async set(user: SafeUserData): Promise<void> {
    await redisClient.set(this.getUserCacheKey(user.id), JSON.stringify(user), 'EX', 300);
  }

  async invalidate(userId: string): Promise<void> {
    await redisClient.del(this.getUserCacheKey(userId));
  }
}

export const userCacheService = new UserCacheService();
