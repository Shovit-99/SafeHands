import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
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

export default router;
