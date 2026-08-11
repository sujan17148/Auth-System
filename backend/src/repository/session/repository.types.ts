import type { Prisma, Session } from '../../generated/prisma/client.js';

export type SafeSession = Omit<Session, 'refreshTokenHash'>;

export interface ISessionRepository {
  createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session>;

  getSession(sessionId: string): Promise<Session | null>;

  getUserSessions(userId: string): Promise<SafeSession[]>;

  updateLastActivity(sessionId: string): Promise<Session>;

  deleteSession(sessionId: string): Promise<void>;

  deleteAllSessions(userId: string): Promise<void>;
}
