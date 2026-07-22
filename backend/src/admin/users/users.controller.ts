import type { Response } from 'express';
import type { TypedAuthRequest } from '../../types/express.js';
import { sendApiResponse, type ApiResponseType } from '../../utility/apiResponse.js';
import type { SafeUserData } from '../../auth/types/auth.types.js';
import { adminUserService } from './users.service.js';
import type { UsersSummary } from '../../repository/users/reposiory.types.js';
import type { ChangeUserStatusPayload, UserIdParams } from './user.types.js';
import type { Session } from '../../generated/prisma/client.js';

class AdminUserController {
  async getAllUsers(
    req: TypedAuthRequest,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData[]>>> {
    const users = await adminUserService.getAllUsers();

    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'Users fetched successfully.',
      data: users,
    });
  }

  async getUsersSummary(
    req: TypedAuthRequest,
    res: Response,
  ): Promise<Response<ApiResponseType<UsersSummary>>> {
    const summary = await adminUserService.getUsersSummary();

    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'User summary fetched successfully.',
      data: summary,
    });
  }

  async getUserSessions(
    req: TypedAuthRequest<never, UserIdParams>,
    res: Response,
  ): Promise<Response<ApiResponseType<Session[]>>> {
    const { id } = req.validated.params;

    const sessions = await adminUserService.getUserSessions(id);

    return sendApiResponse({
      res,
      statusCode: 200,
      message: 'User sessions fetched successfully.',
      data: sessions,
    });
  }

  async changeUserActiveStatus(
    req: TypedAuthRequest<ChangeUserStatusPayload, UserIdParams>,
    res: Response,
  ): Promise<Response<ApiResponseType<SafeUserData>>> {
    const { id } = req.validated.params;
    const { isActive } = req.validated.body;

    const user = await adminUserService.changeUserActiveStatus(id, isActive);

    return sendApiResponse({
      res,
      statusCode: 200,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: user,
    });
  }
}

export const adminUserController = new AdminUserController();
