import type { Prisma, Session } from '../../generated/prisma/client.js';

export type SafeSession = Omit<Session, 'refreshTokenHash'>;

export interface ISessionRepository {
  createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session>;

  getUserSessions(userId: string): Promise<SafeSession[]>;
  getUserSessionsForAuth(userId: string): Promise<Session[]>;

  updateLastActivity(sessionId: string): Promise<SafeSession>;

  deleteSession(sessionId: string): Promise<void>;

  deleteAllSessions(userId: string): Promise<void>;
}
