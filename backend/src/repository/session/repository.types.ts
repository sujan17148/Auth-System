import type { Prisma, Session } from '../../generated/prisma/client.js';

export interface ISessionRepository {
  createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session>;

  getSessionsByUserId(userId: string): Promise<Session[]>;

  updateLastActivity(sessionId: string): Promise<Session>;

  deleteSession(sessionId: string): Promise<void>;

  deleteAllSessions(userId: string): Promise<void>;
}
