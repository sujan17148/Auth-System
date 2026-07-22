import type { Session } from '../../generated/prisma/client.js';
import type { SafeSession } from '../../repository/session/repository.types.js';
import { sessionRepository } from '../../repository/session/session.repository.js';
import { UnauthorizedError } from '../../utility/apiError.js';
import { tokenService } from './token.service.js';

export interface CreateSessionData {
  userId: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}

export interface ISessionService {
  createSession(data: CreateSessionData): Promise<void>;

  validateRefreshSession(refreshToken: string): Promise<Session>;

  updateLastActivity(sessionId: string): Promise<void>;

  deleteSession(sessionId: string): Promise<void>;

  deleteAllSessions(userId: string): Promise<void>;

  getAllSessionsByUserId(userId: string): Promise<SafeSession[]>;
}

class SessionService implements ISessionService {
  async createSession(data: CreateSessionData): Promise<void> {
    const { userAgent, userId, ipAddress, refreshToken, expiresAt } = data;
    const refreshTokenHash = await tokenService.hashRefreshToken(refreshToken);

    await sessionRepository.createSession({
      userAgent,
      userId,
      ipAddress,
      expiresAt,
      refreshTokenHash,
    });
  }

  async validateRefreshSession(refreshToken: string): Promise<Session> {
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const sessions = await sessionRepository.getUserSessionsForAuth(decoded.id);
    for (const session of sessions) {
      const isMatch = await tokenService.verifyRefreshTokenHash(
        refreshToken,
        session.refreshTokenHash,
      );

      if (isMatch) {
        if (session.expiresAt <= new Date()) {
          await sessionRepository.deleteSession(session.id);
          throw new UnauthorizedError('Session expired');
        }

        return session;
      }
    }

    throw new UnauthorizedError('Invalid refresh token');
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await sessionRepository.updateLastActivity(sessionId);
  }

  async getAllSessionsByUserId(userId: string): Promise<SafeSession[]> {
    return sessionRepository.getUserSessions(userId);
  }

  async deleteAllSessions(userId: string): Promise<void> {
    await sessionRepository.deleteAllSessions(userId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await sessionRepository.deleteSession(sessionId);
  }
}

export const sessionService = new SessionService();
