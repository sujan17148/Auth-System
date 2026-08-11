import type { Session } from '../../generated/prisma/client.js';
import type { SafeSession } from '../../repository/session/repository.types.js';
import { sessionRepository } from '../../repository/session/session.repository.js';
import { UnauthorizedError } from '../../utility/apiError.js';
import { sessionCacheService } from './cache.service.js';
import { tokenService } from './token.service.js';

export interface CreateSessionData {
  id?: string;
  userId: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}

export interface ISessionService {
  getSession(sessionId: string): Promise<Session | null>;

  createSession(data: CreateSessionData): Promise<SafeSession>;

  validateRefreshSession(refreshToken: string): Promise<Session>;

  updateLastActivity(sessionId: string): Promise<void>;

  deleteSession(sessionId: string): Promise<void>;

  deleteAllSessions(userId: string): Promise<void>;

  getAllSessionsByUserId(userId: string): Promise<SafeSession[]>;
}

class SessionService implements ISessionService {
  async getSession(sessionId: string): Promise<Session | null> {
    const cachedSession = await sessionCacheService.get(sessionId);

    if (cachedSession) {
      return cachedSession;
    }

    const session = await sessionRepository.getSession(sessionId);

    if (session) {
      await sessionCacheService.set(session);
    }

    return session;
  }
  async createSession(data: CreateSessionData): Promise<Session> {
    const { userAgent, userId, ipAddress, refreshToken, expiresAt, id = null } = data;
    const refreshTokenHash = await tokenService.hashRefreshToken(refreshToken);

    const session = await sessionRepository.createSession({
      ...(id && { id }),
      userAgent,
      userId,
      ipAddress,
      expiresAt,
      refreshTokenHash,
    });

    sessionCacheService.set(session);

    return session;
  }

  async validateRefreshSession(refreshToken: string): Promise<Session> {
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    if (!decoded.sessionId) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    const session = await sessionRepository.getSession(decoded.sessionId);

    if (!session) throw new UnauthorizedError('Invalid refresh token');
    const isMatch = await tokenService.verifyRefreshTokenHash(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isMatch) throw new UnauthorizedError('Invalid refresh token');

    if (session.expiresAt <= new Date()) {
      await sessionRepository.deleteSession(session.id);
      throw new UnauthorizedError('Session expired');
    }

    return session;
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await sessionRepository.updateLastActivity(sessionId);
    await sessionCacheService.invalidate(sessionId);
  }

  async getAllSessionsByUserId(userId: string): Promise<SafeSession[]> {
    return sessionRepository.getUserSessions(userId);
  }

  async deleteAllSessions(userId: string): Promise<void> {
    const sessions = await sessionRepository.getUserSessions(userId);

    const sessionIds = sessions.map((session) => session.id);

    await sessionRepository.deleteAllSessions(userId);

    await sessionCacheService.invalidateAll(sessionIds);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await sessionRepository.deleteSession(sessionId);
    await sessionCacheService.invalidate(sessionId);
  }
}

export const sessionService = new SessionService();
