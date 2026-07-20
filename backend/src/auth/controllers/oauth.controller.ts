import type { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/config.js';
import { oAuthService } from '../services/oauth.service.js';
import { REFRESH_TOKEN_COOKIE } from './auth.controller.js';

export interface IOAuthController {
  initiateGoogleAuth(req: Request, res: Response): void;
  googleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export const googleClient = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri,
);

class OAuthController implements IOAuthController {
  initiateGoogleAuth(req: Request, res: Response): void {
    const url = googleClient.generateAuthUrl({
      access_type: 'online',
      scope: ['profile', 'email'],
      prompt: 'select_account',
    });
    res.redirect(url);
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code, error } = req?.query;

    // user declined consent, or Google itself errored
    if (error) {
      return res.redirect(`${config.clientUrl}/auth/login?error=oauth_denied`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${config.clientUrl}/auth/login?error=oauth_failed`);
    }

    try {
      const refreshToken = await oAuthService.loginWithGoogle(code);

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: config.isProduction,
        sameSite: config.isProduction ? 'none' : 'strict',
      });

      return res.redirect(`${config.clientUrl}`);
    } catch (err) {
      return res.redirect(`${config.clientUrl}/auth/login?error=oauth_failed`);
    }
  }
}

export const oAuthController = new OAuthController();
