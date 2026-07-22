import { z } from 'zod';

export const UserIdParamsSchema = z.object({
  id: z.uuid('Invalid user id.'),
});

export const ChangeUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UserIdParams = z.infer<typeof UserIdParamsSchema>;
export type ChangeUserStatusPayload = z.infer<typeof ChangeUserStatusSchema>;
