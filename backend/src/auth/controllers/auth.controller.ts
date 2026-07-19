import type { TypedRequest, TypedAuthRequest, AuthRequest } from '../../types/express.js';
import type { Response } from 'express';
import type {
  ChangePasswordData,
  CreateUserData,
  LoginData,
  LoginResponse,
  RequestEmailVerificationData,
  RequestPasswordResetData,
  ResetPasswordData,
  SafeUserData,
  VerifyEmailData,
} from '../types/auth.types.js';
import { sendApiResponse, type ApiResponseType } from '../../utility/apiResponse.js';
import { authService } from '../services/auth.service.js';
import { config } from '../../config/config.js';
import { ApiError, UnauthorizedError } from '../../utility/apiError.js';

export interface IAuthController {
  register(
    req: TypedRequest<CreateUserData>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>>;

  login(
    req: TypedRequest<LoginData>,
    res: Response,
  ): Promise<Response<ApiResponseType<LoginResponse>>>;

  me(req: AuthRequest, res: Response): Promise<Response<ApiResponseType<SafeUserData>>>;

  refresh(req: TypedRequest, res: Response): Promise<Response<ApiResponseType<LoginResponse>>>;

  logout(req: TypedRequest, res: Response): Promise<Response<ApiResponseType<null>>>;

  logoutAllDevices(req: TypedRequest, res: Response): Promise<Response<ApiResponseType<null>>>;

  requestEmailVerification(
    req: TypedRequest<RequestEmailVerificationData>,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>>;

  verifyEmail(
    req: TypedRequest<VerifyEmailData>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>>;

  requestPasswordReset(
    req: TypedRequest<RequestPasswordResetData>,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>>;

  resetPassword(
    req: TypedRequest<ResetPasswordData>,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>>;

  changePassword(
    req: TypedAuthRequest<ChangePasswordData>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>>;
}

class AuthController implements IAuthController {
  private readonly REFRESH_TOKEN_COOKIE = 'refreshToken';

  async login(
    req: TypedRequest<LoginData>,
    res: Response,
  ): Promise<Response<ApiResponseType<LoginResponse>>> {
    const { accessToken, refreshToken } = await authService.login(req.validated.body);

    res.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'none' : 'strict',
    });

    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'Login successful',
      data: { accessToken },
    });
  }

  async register(
    req: TypedRequest<CreateUserData>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>> {
    const newUser = await authService.registerUser(req.validated.body);

    return sendApiResponse({
      res,
      statusCode: 201,
      message: 'User Created Successfully',
      data: newUser,
    });
  }

  async me(req: AuthRequest, res: Response): Promise<Response<ApiResponseType<SafeUserData>>> {
    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'User fetched successfully',
      data: req.user,
    });
  }

  async logout(req: TypedRequest, res: Response): Promise<Response<ApiResponseType<null>>> {
    const refreshToken = req.cookies?.[this.REFRESH_TOKEN_COOKIE];
    if (!refreshToken) throw new UnauthorizedError();
    res.clearCookie(this.REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: config.isProduction, //HTTPS only in production
      sameSite: config.isProduction ? 'none' : 'strict', //CSRF protection
    });
    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'Logged out successfully',
      data: null,
    });
  }

  async refresh(
    req: TypedRequest,
    res: Response,
  ): Promise<Response<ApiResponseType<LoginResponse>>> {
    const refreshToken = req.cookies?.[this.REFRESH_TOKEN_COOKIE];
    if (!refreshToken) throw new UnauthorizedError();

    const accessToken = await authService.rotateToken(refreshToken);

    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'New Token generated successfully',
      data: { accessToken },
    });
  }

  async changePassword(
    req: TypedAuthRequest<ChangePasswordData>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>> {
    const userId = req.user.id;
    const user = await authService.changePassword(userId, req.validated.body);
    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'Password changed  Successfully',
      data: user,
    });
  }

  async requestEmailVerification(
    req: TypedRequest<RequestEmailVerificationData>,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>> {
    await authService.requestEmailVerification(req.validated.body);
    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'Email verification request sent ',
      data: null,
    });
  }

  async requestPasswordReset(
    req: TypedRequest<RequestPasswordResetData>,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>> {
    throw new ApiError('Method not implemented');
  }

  async logoutAllDevices(
    req: TypedRequest,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>> {
    throw new ApiError('Method not implemented');
  }
  async verifyEmail(
    req: TypedRequest<VerifyEmailData>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>> {
    const user = await authService.verifyEmail(req.validated.body);
    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'Email Verified successfully ',
      data: user,
    });
  }

  async resetPassword(
    req: TypedRequest<ResetPasswordData>,
    res: Response,
  ): Promise<Response<ApiResponseType<null>>> {
    throw new ApiError('Method not implemented');
  }
}

export const authController = new AuthController();
