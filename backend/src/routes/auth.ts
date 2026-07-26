import { Router } from 'express';
import { register, login, getMe, updateProfile, updatePassword, generate2FA, verify2FA, login2FA } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateEmailDomain } from '../middleware/validators';
import { validateRegister, validateLogin } from '../middleware/requestValidators';

const router = Router();

// POST /api/auth/register
router.post('/register', validateRegister, validateEmailDomain, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

// PATCH /api/auth/profile
router.patch('/profile', authenticate, updateProfile);

// PATCH /api/auth/password
router.patch('/password', authenticate, updatePassword);

// 2FA Routes
router.post('/2fa/generate', authenticate, generate2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/login/2fa', login2FA);

export default router;
