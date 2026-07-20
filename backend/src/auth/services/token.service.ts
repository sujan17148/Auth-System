import { config } from '../../config/config.js';
import { UnauthorizedError } from '../../utility/apiError.js';
import type { SafeUserData, TokenPayload } from '../types/auth.types.js';
import jwt, { type SignOptions } from 'jsonwebtoken';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateAccessToken(user: SafeUserData): string;
  generateRefreshToken(user: SafeUserData): string;
  generateTokenPair(user: SafeUserData): TokenPair;
  verifyAccessToken(accessToken: string): TokenPayload;
  verifyRefreshToken(refreshToken: string): TokenPayload;
}

class TokenService implements ITokenService {
  private readonly accessTokenSecret = config.accessTokenKey;
  private readonly accessTokenExpiry = config.accessTokenExpiry;
  private readonly refreshTokenSecret = config.refreshTokenKey;
  private readonly refreshTokenExpiry = config.refreshTokenExpiry;

  private readonly accessOptions: SignOptions = {
    expiresIn: this.accessTokenExpiry as string & SignOptions['expiresIn'],
  };

  private readonly refreshOptions: SignOptions = {
    expiresIn: this.refreshTokenExpiry as string & SignOptions['expiresIn'],
  };

  generateAccessToken(user: SafeUserData): string {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      this.accessTokenSecret,
      this.accessOptions,
    );
  }

  generateRefreshToken(user: SafeUserData): string {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      this.refreshTokenSecret,
      this.refreshOptions,
    );
  }

  generateTokenPair(user: SafeUserData): TokenPair {
    const refreshToken = this.generateRefreshToken(user);
    const accessToken = this.generateAccessToken(user);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(accessToken: string): TokenPayload {
    try {
      return jwt.verify(accessToken, this.accessTokenSecret) as TokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
      } else if (err instanceof jwt.JsonWebTokenError) {
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  verifyRefreshToken(refreshToken: string): TokenPayload {
    try {
      return jwt.verify(refreshToken, this.refreshTokenSecret) as TokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
      } else if (err instanceof jwt.JsonWebTokenError) {
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export const tokenService = new TokenService();
