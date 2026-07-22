export const APP_QUERY_KEYS = {
  root: ['app'] as const,
  auth: {
    root: ['app', 'auth'] as const,
    me: ['app', 'auth', 'me'] as const,
  },
};

export const ADMIN_QUERY_KEYS = {
  root: ['app', 'admin'] as const,
  users: {
    root: ['app', 'admin', 'users'] as const,
    summary: ['app', 'admin', 'users', 'summary'] as const,
    list: ['app', 'admin', 'users', 'list'] as const,
    session: (userId: string) => ['app', 'admin', 'users', 'session', userId] as const,
  },
};
