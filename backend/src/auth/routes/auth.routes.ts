import { Router } from 'express';
import { validateSchema } from '../../middlewares/schemaValidator.middlewares.js';
import {
  ChangePasswordSchema,
  CreateUserSchema,
  LoginSchema,
  RequestEmailVerificationSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  VerifyEmailSchema,
} from '../schema/auth.schema.js';
import { asyncHandler } from '../../utility/asyncHandler.js';
import { authController } from '../controllers/auth.controller.js';
import { requireVerifiedEmail, verifyJWT } from '../../middlewares/auth.middlewares.js';

const router = Router();

router.post('/login', validateSchema({ body: LoginSchema }), asyncHandler(authController.login));

router.get('/me', verifyJWT, asyncHandler(authController.me));

router.post(
  '/register',
  validateSchema({ body: CreateUserSchema }),
  asyncHandler(authController.register),
);

router.post('/token/refresh', asyncHandler(authController.refresh));

router.post(
  '/change-password',
  validateSchema({ body: ChangePasswordSchema }),
  verifyJWT,
  requireVerifiedEmail,
  asyncHandler(authController.changePassword),
);

router.post('/logout', asyncHandler(authController.logout));

router.post('/logout-all', verifyJWT, asyncHandler(authController.logoutAllDevices));

router.post(
  '/request-verify-email',
  validateSchema({ body: RequestEmailVerificationSchema }),
  asyncHandler(authController.requestEmailVerification),
);

router.post(
  '/verify-email',
  validateSchema({ body: VerifyEmailSchema }),
  asyncHandler(authController.verifyEmail),
);

router.post(
  '/request-password-reset',
  validateSchema({ body: RequestPasswordResetSchema }),
  asyncHandler(authController.requestPasswordReset),
);

router.post(
  '/reset-password',
  validateSchema({ body: ResetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);

router.patch(
  '/me',
  validateSchema({ body: UpdateProfileSchema }),
  verifyJWT,
  requireVerifiedEmail,
  asyncHandler(authController.updateProfile),
);

export default router;
