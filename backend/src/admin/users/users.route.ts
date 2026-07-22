import { Router } from 'express';
import { adminUserController } from './users.controller.js';
import { asyncHandler } from '../../utility/asyncHandler.js';
import { validateSchema } from '../../middlewares/schemaValidator.middlewares.js';
import { ChangeUserStatusSchema, UserIdParamsSchema } from './user.types.js';

const router = Router();

router.get('/', asyncHandler(adminUserController.getAllUsers));

router.get('/summary', asyncHandler(adminUserController.getUsersSummary));

router.get(
  '/:id/sessions',
  validateSchema({ params: UserIdParamsSchema }),
  asyncHandler(adminUserController.getUserSessions),
);

router.patch(
  '/:id/status',
  validateSchema({ params: UserIdParamsSchema, body: ChangeUserStatusSchema }),
  asyncHandler(adminUserController.changeUserActiveStatus),
);

export default router;
