import { config } from '../../config/config.js';
import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type {
  ChangePasswordData,
  CreateUserData,
  LoginData,
  LoginServiceResponse,
  RequestEmailVerificationData,
  RequestPasswordResetData,
  ResetPasswordData,
  SafeUserData,
  TokenPayload,
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
}

class AuthService implements IAuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly OTP_EXPIRY_MINUTES = 2;

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
    await this.requestEmailVerification({
      email: newUser.email,
    });

    return newUser;
  }

  async login(data: LoginData): Promise<LoginServiceResponse> {
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

    if (!user.emailVerified) {
      throw new ForbiddenError('Please verify your email first.');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async rotateToken(refreshToken: string): Promise<string> {
    const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as TokenPayload;
    const user = await this.getUserById(decoded.id);
    if (!user) throw new UnauthorizedError('Invalid or expired token');

    if (!user.isActive) {
      throw new ForbiddenError('Account has been deactivated.');
    }

    return this.generateAccessToken(user);
  }

  private generateAccessToken(user: SafeUserData): string {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      this.accessTokenSecret,
      this.accessOptions,
    );
  }

  private generateRefreshToken(user: SafeUserData): string {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      this.refreshTokenSecret,
      this.refreshOptions,
    );
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
    const user = await userRepository.getUserByEmail(data.email);

    if (!user) {
      throw new NotFoundError('User with this email does not exist');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated.');
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

    await userRepository.updatePassword(user.id, passwordHash);

    void passwordResetRepository.deleteOtp(user.id);
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

    return userRepository.updatePassword(user.id, passwordHash);
  }

  async deactivateUser(id: string): Promise<SafeUserData> {
    return userRepository.deactivateUser(id);
  }

  async activateUser(id: string): Promise<SafeUserData> {
    return userRepository.activateUser(id);
  }
}

export const authService = new AuthService();
