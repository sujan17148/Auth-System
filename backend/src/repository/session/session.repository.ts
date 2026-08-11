import type { Prisma, Session } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import type { ISessionRepository, SafeSession } from './repository.types.js';

class SessionRepository implements ISessionRepository {
  
  async getSession(sessionId: string): Promise<Session | null> {
    return await prisma.session.findUnique({ where: { id: sessionId } });
  }

  async createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return await prisma.session.create({ data });
  }

  async getUserSessions(userId: string): Promise<SafeSession[]> {
    return await prisma.session.findMany({ where: { userId }, omit: { refreshTokenHash: true } });
  }

  async updateLastActivity(sessionId: string): Promise<Session> {
    return await prisma.session.update({
      data: { lastActivity: new Date() },
      where: { id: sessionId },
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
