import { redisClient } from '../../config/redis.js';
import type { Session } from '../../generated/prisma/client.js';
import type { SafeUserData } from '../types/auth.types.js';

export interface IUserCacheService {
  get(userId: string): Promise<SafeUserData | null>;
  set(user: SafeUserData): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

export interface ISessionCacheService {
  get(sessionId: string): Promise<Session | null>;
  set(session: Session): Promise<void>;
  invalidate(sessionId: string): Promise<void>;
  invalidateAll(sessionIds: string[]): Promise<void>;
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

class SessionCacheService implements ISessionCacheService {
  private getSessionCacheKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async get(sessionId: string): Promise<Session | null> {
    const cached = await redisClient.get(this.getSessionCacheKey(sessionId));

    if (!cached) return null;

    const session = JSON.parse(cached);

    return {
      ...session,
      expiresAt: new Date(session.expiresAt),
    };
  }

  async set(session: Session): Promise<void> {
    const ttl = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);

    if (ttl <= 0) return;

    await redisClient.set(this.getSessionCacheKey(session.id), JSON.stringify(session), 'EX', ttl);
  }

  async invalidate(sessionId: string): Promise<void> {
    await redisClient.del(this.getSessionCacheKey(sessionId));
  }

  async invalidateAll(sessionIds: string[]): Promise<void> {
    if (sessionIds.length === 0) return;

    const keys = sessionIds.map((sessionId) => this.getSessionCacheKey(sessionId));

    await redisClient.del(...keys);
  }
}

export const userCacheService = new UserCacheService();
export const sessionCacheService = new SessionCacheService();
