import { Router } from 'express';
import { oAuthController } from '../controllers/oauth.controller.js';

const router = Router();

router.get('/google', oAuthController.initiateGoogleAuth);
router.get('/google/callback', oAuthController.googleCallback);

router.get('/github', oAuthController.initiateGithubAuth);
router.get('/github/callback', oAuthController.githubCallback);

export default router;
