import bcrypt from 'bcrypt';
import type {
  ChangePasswordData,
  CreateUserData,
  EmailVerificationData,
  LoginData,
  LoginServiceData,
  LoginServiceResponse,
  RequestEmailVerificationData,
  RequestPasswordResetData,
  ResetPasswordData,
  SafeUserData,
  updateProfileData,
  VerifyEmailData,
} from '../types/auth.types.js';
import {
  ApiError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../utility/apiError.js';
import { tokenService, type TokenPair } from './token.service.js';
import { sessionService } from './session.service.js';
import { prisma } from '../../lib/prisma.js';
import { userRepository } from '../../repository/users/user.repository.js';
import { verificationTokenService } from './verification.service.js';
import { config } from '../../config/config.js';
import { redisClient } from '../../config/redis.js';
import { sessionCacheService, userCacheService } from './cache.service.js';
import { emailQueue } from '../../queue/queues.js';
import { EmailJobType } from '../../queue/worker.js';
import { randomUUID } from 'node:crypto';

export interface IAuthService {
  getUserById(id: string): Promise<SafeUserData>;
  registerUser(data: CreateUserData): Promise<SafeUserData>;
  login(data: LoginData): Promise<LoginServiceResponse>;
  rotateToken(token: string): Promise<string>;
  verifyEmail(data: VerifyEmailData): Promise<SafeUserData>;
  requestEmailVerification(data: RequestEmailVerificationData): Promise<void>;
  requestPasswordReset(data: RequestPasswordResetData): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  updateProfile(userId: string, data: updateProfileData): Promise<SafeUserData>;
  changePassword(userId: string, data: ChangePasswordData): Promise<SafeUserData>;
  changeUsername(userId: string, username: string): Promise<SafeUserData>;
  logoutUser(refreshToken: string): Promise<void>;
  logoutAllDevices(userId: string): Promise<void>;
}

class AuthService implements IAuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly OTP_EXPIRY_MINUTES = 5;

  private getEmailVerificationKey(userId: string): string {
    return `email_verification:${userId}`;
  }

  private getPasswordResetKey(tokenHash: string): string {
    return `password_reset:${tokenHash}`;
  }

  async getUserById(id: string): Promise<SafeUserData> {
    const cachedUser = await userCacheService.get(id);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await userRepository.getUserById(id);
    if (!user) throw new NotFoundError('User not found');
    await userCacheService.set(user);
    return user;
  }

  async registerUser(data: CreateUserData): Promise<SafeUserData> {
    const existingEmail = await userRepository.getUserByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('User with this email already exists.');
    }

    const existingUsername = await userRepository.getUserByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('User with this username already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const newUser = await userRepository.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      passwordHash,
    });
    return newUser;
  }

  async login(data: LoginServiceData): Promise<TokenPair> {
    const user = await userRepository.getUserByIdentifier(data.identifier);

    if (!user) {
      throw new UnauthorizedError('Invalid email/username or password.');
    }

    // User exists but has no password (OAuth-only account)
    if (!user.passwordHash) {
      throw new UnauthorizedError(
        'This account uses social login. Please sign in with your provider.',
      );
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid email/username or password.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated.');
    }

    const sessionId = randomUUID();

    const tokenPair = tokenService.generateTokenPair(user, sessionId);

    await sessionService.createSession({
      id: sessionId,
      userId: user.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt: tokenPair.refreshTokenExpiresAt,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });

    return tokenPair;
  }

  async rotateToken(refreshToken: string): Promise<string> {
    const session = await sessionService.validateRefreshSession(refreshToken);

    const user = await this.getUserById(session.userId);

    if (!user) throw new UnauthorizedError('Invalid or expired token');

    if (!user.isActive) {
      throw new ForbiddenError('Account has been deactivated.');
    }

    const accessToken = tokenService.generateAccessToken(user, session.id);
    await sessionService.updateLastActivity(session.id);
    return accessToken;
  }

  async verifyEmail(data: VerifyEmailData): Promise<SafeUserData> {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new NotFoundError('user not found');

    const key = this.getEmailVerificationKey(user.id);

    const storedTokenData = (await redisClient.hgetall(key)) as unknown as EmailVerificationData;

    if (!storedTokenData || Object.keys(storedTokenData).length === 0) {
      throw new UnauthorizedError('Email could not be verified');
    }

    const { otpHash, attempts, maxAttempts } = storedTokenData;

    if (attempts >= maxAttempts) {
      throw new UnauthorizedError('Maximum verification attempts exceeded');
    }

    const isMatch = verificationTokenService.verifyToken(data.otp, otpHash);

    if (!isMatch) {
      await redisClient.hincrby(key, 'attempts', 1);
      throw new UnauthorizedError('Invalid email or otp');
    }

    void redisClient.del(key);

    const tempUser = await userRepository.verifyEmail(user.id);
    await userCacheService.invalidate(user.id);
    await emailQueue.add(EmailJobType.WELCOME_EMAIL, {
      email: user.email,
      firstName: user.firstName,
    });
    return tempUser;
  }

  async requestEmailVerification(data: RequestEmailVerificationData): Promise<void> {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new NotFoundError('User with this email does not exist');

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated.');
    }

    if (user.emailVerified) {
      throw new ConflictError('Email is already verified.');
    }

    const otp = verificationTokenService.generateOTP();
    const otpHash = verificationTokenService.hashToken(otp);

    const key = this.getEmailVerificationKey(user.id);

    const payload: EmailVerificationData = { otpHash, attempts: '0', maxAttempts: '3' };

    await redisClient.hset(key, payload);

    await redisClient.expire(key, this.OTP_EXPIRY_MINUTES * 60);

    await emailQueue.add(
      EmailJobType.EMAIL_VERIFICATION_EMAIL,
      {
        email: user.email,
        firstName: user.firstName,
        otp,
      },
      {
        priority: 1,
      },
    );
  }

  async requestPasswordReset(data: RequestPasswordResetData): Promise<void> {
    const user = await userRepository.getUserByIdentifier(data.email);

    if (!user) {
      throw new NotFoundError('User with this email does not exist');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(
        'This account uses social login. Please sign in with your provider.',
      );
    }

    if (!user.emailVerified) {
      throw new ForbiddenError('Please verify your email first.');
    }

    const token = verificationTokenService.generateSecureToken();
    const tokenHash = verificationTokenService.hashToken(token);

    const key = this.getPasswordResetKey(tokenHash);

    await redisClient.set(key, user.id, 'EX', this.OTP_EXPIRY_MINUTES * 60);

    const resetLink = `${config.clientUrl}/auth/reset-password?code=${token}`;

    await emailQueue.add(
      EmailJobType.PASSWORD_RESET_EMAIL,
      {
        email: user.email,
        firstName: user.firstName,
        resetLink,
      },
      { priority: 1 },
    );
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const incomingTokenHash = verificationTokenService.hashToken(data.code);

    const key = this.getPasswordResetKey(incomingTokenHash);

    const userId = await redisClient.get(key);

    if (!userId) {
      throw new UnauthorizedError('This password reset link is invalid or has already been used.');
    }

    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact support.');
    }

    if (!user.emailVerified) {
      throw new ForbiddenError('Please verify your email before resetting your password.');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, this.SALT_ROUNDS);

    const sessionIds = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
        },
      });

      const sessions = await tx.session.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      return sessions.map((session) => session.id);
    });

    await sessionCacheService.invalidateAll(sessionIds);

    // Invalidate password-reset token
    await redisClient.del(key);
  }

  async updateProfile(userId: string, data: updateProfileData): Promise<SafeUserData> {
    if (data.username) {
      const existingUser = await userRepository.getUserByUsername(data.username);

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Username already exists.');
      }
    }

    const user = await userRepository.updateProfile(userId, data);
    await userCacheService.invalidate(userId);

    return user;
  }

  async changeUsername(userId: string, username: string): Promise<SafeUserData> {
    throw new ApiError('Method not implemented.');
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<SafeUserData> {
    const user = await userRepository.getUserWithPasswordById(userId);

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account has been deactivated.');
    }

    if (!user.emailVerified) {
      throw new ForbiddenError('Please verify your email.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('This account uses social login.');
    }

    const isMatch = await bcrypt.compare(data.oldPassword, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, this.SALT_ROUNDS);

    const { updatedUser, sessionIds } = await prisma.$transaction(async (tx) => {
      const tempUser = await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: passwordHash,
        },
        omit: { passwordHash: true },
      });

      const sessions = await tx.session.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });
      return {
        updatedUser: tempUser,
        sessionIds: sessions.map((session) => session.id),
      };
    });

    await sessionCacheService.invalidateAll(sessionIds);

    return updatedUser;
  }

  async logoutUser(refreshToken: string): Promise<void> {
    const session = await sessionService.validateRefreshSession(refreshToken);
    await sessionService.deleteSession(session.id);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await sessionService.deleteAllSessions(userId);
  }
}

export const authService = new AuthService();
