import 'dotenv/config';
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value?.trim()) throw new Error(`${key} missing can't start the app`);
  return value;
};

export const config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  nodeEnvironment: requireEnv('NODE_ENV'),
  serverPort: requireEnv('PORT'),
  accessTokenKey: requireEnv('ACCESSS_TOKEN_SECRET_KEY'),
  accessTokenExpiry: requireEnv('ACCESS_TOKEN_EXPIRY'),
  refreshTokenKey: requireEnv('REFRESH_TOKEN_SECRET_KEY'),
  refreshTokenExpiry: requireEnv('REFRESH_TOKEN_EXPIRY'),
  allowedOrigins: requireEnv('ALLOWED_ORIGINS').split(',').filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',

  smtpHost: requireEnv('SMTP_HOST'),
  smtpPort: requireEnv('SMTP_PORT'),
  smtpUser: requireEnv('SMTP_USER'),
  smtpPassword: requireEnv('SMTP_PASS'),

  googleClientId: requireEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: requireEnv('GOOGLE_REDIRECT_URI'),

  clientUrl: requireEnv('CLIENT_URL'),
} as const;
