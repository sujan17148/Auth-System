import { Router } from 'express';
import { oAuthController } from '../controllers/oauth.controller.js';
import { loginRateLimiter } from '../../middlewares/rateLimits.middlewares.js';

const router = Router();

router.get('/google', loginRateLimiter, oAuthController.initiateGoogleAuth);
router.get('/google/callback', oAuthController.googleCallback);

router.get('/github', loginRateLimiter, oAuthController.initiateGithubAuth);
router.get('/github/callback', oAuthController.githubCallback);

export default router;
