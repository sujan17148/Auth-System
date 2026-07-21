import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/config.js';
import { oAuthService } from '../services/oauth.service.js';
import { REFRESH_TOKEN_COOKIE } from './auth.controller.js';
import { generateOAuthState, verifyOAuthState } from '../../utility/oauthHelpers.js';
import { BadRequestError, UnauthorizedError } from '../../utility/apiError.js';

export interface IOAuthController {
  initiateGoogleAuth(req: Request, res: Response): void;
  googleCallback(req: Request, res: Response): Promise<void>;
  initiateGithubAuth(req: Request, res: Response): void;
  githubCallback(req: Request, res: Response): Promise<void>;
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

  async googleCallback(req: Request, res: Response): Promise<void> {
    const { code, error } = req?.query;

    try {
      if (error) {
        throw new UnauthorizedError('User declined consent or Google rejected');
      }

      if (!code || typeof code !== 'string') {
        throw new BadRequestError('Missing OAuth code.');
      }

      const refreshToken = await oAuthService.loginWithGoogle(code);

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: config.isProduction,
        sameSite: config.isProduction ? 'none' : 'strict',
      });

      return res.redirect(`${config.clientUrl}`);
    } catch (err) {
      console.log('github oauth failed', err);
      return res.redirect(`${config.clientUrl}/auth/login?error=oauth_failed`);
    }
  }

  initiateGithubAuth(req: Request, res: Response): void {
    const state = generateOAuthState();

    const githubAuthUrl =
      'https://github.com/login/oauth/authorize?' +
      new URLSearchParams({
        client_id: config.githubClientId,
        redirect_uri: config.githubRedirectUri,
        scope: 'user:email',
        state,
      }).toString();

    res.redirect(githubAuthUrl);
  }

  async githubCallback(req: Request, res: Response): Promise<void> {
    const { code, state } = req.query;
    try {
      if (!code || typeof code !== 'string') {
        throw new BadRequestError('Missing OAuth code.');
      }

      if (!state || typeof state !== 'string') {
        throw new BadRequestError('Missing OAuth state.');
      }

      verifyOAuthState(state);
      const refreshToken = await oAuthService.loginWithGithub(code);

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: config.isProduction,
        sameSite: config.isProduction ? 'none' : 'strict',
      });

      return res.redirect(`${config.clientUrl}`);
    } catch (err) {
      console.log('github oauth failed', err);
      return res.redirect(`${config.clientUrl}/auth/login?error=oauth_failed`);
    }
  }
}

export const oAuthController = new OAuthController();
