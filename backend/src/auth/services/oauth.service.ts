import axios from 'axios';
import { config } from '../../config/config.js';
import { OAuthProvider } from '../../generated/prisma/enums.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError, ForbiddenError } from '../../utility/apiError.js';
import { googleClient } from '../controllers/oauth.controller.js';
import type { SafeUserData } from '../types/auth.types.js';
import { tokenService, type TokenPair } from './token.service.js';
import { userRepository } from '../../repository/users/user.repository.js';
import { oAuthRepository } from '../../repository/oauth-account/oauth-account.repository.js';
import { sessionService } from './session.service.js';

interface ResolveOAuthUserInput {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  firstName: string;
  userAgent: string;
  ipAddress: string;
}

interface OAuthLoginInput {
  code: string;
  ipAddress: string;
  userAgent: string;
}

interface GithubAccessToken {
  access_token: string;
}

interface GithubUser {
  id: number;
  login: string;
  name: string | null;
}

interface GithubEmails {
  email: string;
  primary: boolean;
  verified: boolean;
}

export interface IOAuthService {
  loginWithGoogle(data: OAuthLoginInput): Promise<string>;
  loginWithGithub(data: OAuthLoginInput): Promise<string>;
}

const MAX_USERNAME_ATTEMPTS = 5;

class OAuthService implements IOAuthService {
  async loginWithGoogle(data: OAuthLoginInput): Promise<string> {
    const { ipAddress, code, userAgent } = data;
    const { tokens } = await googleClient.getToken(code);
    if (!tokens.id_token) throw new BadRequestError('Google did not return an id_token');

    // 2. verify + decode
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new BadRequestError('Invalid Google token payload');
    }

    const { refreshToken } = await this.completeOAuthLogin({
      provider: OAuthProvider.GOOGLE,
      providerAccountId: payload.sub,
      email: payload.email,
      firstName: payload.given_name ?? 'user',
      ipAddress,
      userAgent,
    });
    return refreshToken;
  }

  async loginWithGithub(payload: OAuthLoginInput): Promise<string> {
    const { ipAddress, code, userAgent } = payload;
    const { data } = await axios.post<GithubAccessToken>(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: config.githubRedirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const getUserPromise = axios.get<GithubUser>('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const getUserEmailsPromise = axios.get<GithubEmails[]>('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const [githubUser, emails] = await Promise.all([getUserPromise, getUserEmailsPromise]);

    const primaryEmail = emails.data.find((email) => email.primary && email.verified);
    if (!primaryEmail) {
      throw new BadRequestError('No verified primary email found.');
    }

    const firstName = githubUser.data.name
      ? githubUser.data.name.trim().split(/\s+/)[0]!
      : githubUser.data.login;

    const { refreshToken } = await this.completeOAuthLogin({
      provider: OAuthProvider.GITHUB,
      providerAccountId: String(githubUser.data.id),
      email: primaryEmail.email,
      firstName,
      userAgent,
      ipAddress,
    });

    return refreshToken;
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    const cleanBase = base.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
      const suffix = Math.floor(1000 + Math.random() * 9000); // 4 digits
      const candidate = `${cleanBase}${suffix}`;

      const existing = await userRepository.getUserByUsername(candidate);
      if (!existing) return candidate;
    }

    throw new Error('Could not generate a unique username, try again');
  }

  private async resolveOrCreateOAuthUser(input: ResolveOAuthUserInput): Promise<SafeUserData> {
    const { provider, providerAccountId, email, firstName } = input;

    const existingLink = await oAuthRepository.findByProviderAccount(provider, providerAccountId);

    if (existingLink) {
      const user = await userRepository.getUserById(existingLink.userId);
      if (!user) throw new Error('User resolution failed unexpectedly');
      return user;
    }

    const existingUser = await userRepository.getUserByEmail(email);

    if (existingUser) {
      await oAuthRepository.createOAuthAccount({
        userId: existingUser.id,
        provider,
        providerAccountId,
      });

      //auth provider verified the email so if not verified by default jsut verify now
      if (!existingUser.emailVerified) {
        const verifiedUser = await userRepository.verifyEmail(existingUser.id);
        return verifiedUser;
      }

      return existingUser;
    }

    const username = await this.generateUniqueUsername(firstName);

    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          username,
          firstName,
          lastName: null,
          emailVerified: true,
          passwordHash: null,
        },
        omit: { passwordHash: true },
      });

      await tx.oAuthAccount.create({
        data: { userId: created.id, provider, providerAccountId },
      });

      return created;
    });

    return newUser;
  }

  private async completeOAuthLogin(input: ResolveOAuthUserInput): Promise<TokenPair> {
    const user = await this.resolveOrCreateOAuthUser(input);

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been suspended.');
    }

    const tokenPair = tokenService.generateTokenPair(user);

    await sessionService.createSession({
      userId: user.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt: tokenPair.refreshTokenExpiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    return tokenPair;
  }
}

export const oAuthService = new OAuthService();
