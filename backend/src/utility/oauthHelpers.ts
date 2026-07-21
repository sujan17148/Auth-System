import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/config.js';

interface OAuthStatePayload {
  nonce: string;
}

export function generateOAuthState(): string {
  return jwt.sign(
    {
      nonce: crypto.randomUUID(),
    },
    config.oauthStateSecret,
    {
      expiresIn: config.oauthStateExpiry as string & SignOptions['expiresIn'],
    },
  );
}

export function verifyOAuthState(state: string): OAuthStatePayload {
  return jwt.verify(state, config.oauthStateSecret) as OAuthStatePayload;
}
