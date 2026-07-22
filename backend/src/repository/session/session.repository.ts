import type { Prisma, Session } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import type { ISessionRepository, SafeSession } from './repository.types.js';

class SessionRepository implements ISessionRepository {
  async createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return await prisma.session.create({ data });
  }

  async getUserSessionsForAuth(userId: string): Promise<Session[]> {
    return await prisma.session.findMany({ where: { userId } });
  }

  async getUserSessions(userId: string): Promise<SafeSession[]> {
    return await prisma.session.findMany({ where: { userId }, omit: { refreshTokenHash: true } });
  }

  async updateLastActivity(sessionId: string): Promise<SafeSession> {
    return await prisma.session.update({
      data: { lastActivity: new Date() },
      where: { id: sessionId },
      omit: { refreshTokenHash: true },
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await prisma.session.delete({ where: { id: sessionId } });
  }

  async deleteAllSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }
}

export const sessionRepository = new SessionRepository();
