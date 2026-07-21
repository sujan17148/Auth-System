import bcrypt from 'bcrypt';
import type {
  ChangePasswordData,
  CreateUserData,
  LoginData,
  LoginServiceData,
  LoginServiceResponse,
  RequestEmailVerificationData,
  RequestPasswordResetData,
  ResetPasswordData,
  SafeUserData,
  VerifyEmailData,
} from '../types/auth.types.js';
import { userRepository } from '../repository/user.repository.js';
import { passwordResetRepository } from '../repository/password-reset.repository.js';
import { emailVerificationRepository } from '../repository/email-verification.repository.js';
import {
  ApiError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../utility/apiError.js';
import { mailService } from '../../mail/mail.service.js';
import { tokenService, type TokenPair } from './token.service.js';
import { sessionService } from './session.service.js';
import { prisma } from '../../lib/prisma.js';

export interface IAuthService {
  getUserById(id: string): Promise<SafeUserData | null>;
  registerUser(data: CreateUserData): Promise<SafeUserData>;
  login(data: LoginData): Promise<LoginServiceResponse>;
  rotateToken(token: string): Promise<string>;
  verifyEmail(data: VerifyEmailData): Promise<SafeUserData>;
  requestEmailVerification(data: RequestEmailVerificationData): Promise<void>;
  requestPasswordReset(data: RequestPasswordResetData): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  changePassword(userId: string, data: ChangePasswordData): Promise<SafeUserData>;
  changeEmail(userId: string, email: string): Promise<SafeUserData>;
  changeUsername(userId: string, username: string): Promise<SafeUserData>;
  activateUser(id: string): Promise<SafeUserData>;
  deactivateUser(id: string): Promise<SafeUserData>;
  logoutUser(refreshToken: string): Promise<void>;
  logoutAllDevices(userId: string): Promise<void>;
}

class AuthService implements IAuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly OTP_EXPIRY_MINUTES = 2;

  async getUserById(id: string): Promise<SafeUserData | null> {
    const user = await userRepository.getUserById(id);
    if (!user) throw new NotFoundError('User not found');
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

    const tokenPair = tokenService.generateTokenPair(user);

    await sessionService.createSession({
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

    const accessToken = tokenService.generateAccessToken(user);
    await sessionService.updateLastActivity(session.id);
    return accessToken;
  }

  private generateOtp(): string {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
  }

  private async generateOtpHash(otp: string): Promise<string> {
    return await bcrypt.hash(otp.toString(), this.SALT_ROUNDS);
  }

  async verifyEmail(data: VerifyEmailData): Promise<SafeUserData> {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new NotFoundError('user not found');

    const emailValidationToken = await emailVerificationRepository.getOtpByUserId(user.id);

    if (!emailValidationToken) throw new UnauthorizedError('Email could not be verified');

    const isOtpExpired = emailValidationToken.expiresAt <= new Date();

    if (isOtpExpired) throw new UnauthorizedError('Otp has expired');

    const isMatch = await bcrypt.compare(data.otp, emailValidationToken.otpHash);

    if (!isMatch) throw new UnauthorizedError('Invalid email or otp');

    void emailVerificationRepository.deleteOtp(user.id);

    return userRepository.verifyEmail(user.id);
  }

  async requestEmailVerification(data: RequestEmailVerificationData): Promise<void> {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new NotFoundError('User with this email does not exist');

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated.');
    }

    const otp = this.generateOtp();
    const otpHash = await this.generateOtpHash(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await emailVerificationRepository.upsertOtp({ userId: user.id, otpHash, expiresAt });

    void mailService.sendVerificationEmail({ email: user.email, firstName: user.firstName, otp });
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

    const otp = this.generateOtp();
    const otpHash = await this.generateOtpHash(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await passwordResetRepository.upsertOtp({
      userId: user.id,
      otpHash,
      expiresAt,
    });

    void mailService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      otp,
    });
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const user = await userRepository.getUserByEmail(data.email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordResetToken = await passwordResetRepository.getOtpByUserId(user.id);

    if (!passwordResetToken) {
      throw new UnauthorizedError('Password could not be reset');
    }

    if (passwordResetToken.expiresAt <= new Date()) {
      throw new UnauthorizedError('OTP has expired');
    }

    const isMatch = await bcrypt.compare(data.otp, passwordResetToken.otpHash);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or OTP');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, this.SALT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: passwordHash,
        },
        omit: { passwordHash: true },
      });

      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
    });
  }

  async changeEmail(userId: string, email: string): Promise<SafeUserData> {
    throw new ApiError('Method not implemented.');
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

    const updatedUser = await prisma.$transaction(async (tx) => {
      const tempUser = await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: passwordHash,
        },
        omit: { passwordHash: true },
      });

      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });
      return tempUser;
    });

    return updatedUser;
  }

  async logoutUser(refreshToken: string): Promise<void> {
    const session = await sessionService.validateRefreshSession(refreshToken);
    await sessionService.deleteSession(session.id);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await sessionService.deleteAllSessions(userId);
  }

  async deactivateUser(id: string): Promise<SafeUserData> {
    return userRepository.deactivateUser(id);
  }

  async activateUser(id: string): Promise<SafeUserData> {
    return userRepository.activateUser(id);
  }
}

export const authService = new AuthService();
