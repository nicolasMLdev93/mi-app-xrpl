import { Router } from 'express';
import { register, login } from '../controllers/authController';
import {
  registerValidationRules,
  loginValidationRules,
  validate,
} from '../middlewares/validationMiddleware';

const router = Router();

router.post(
  '/register',
  registerValidationRules,
  validate,
  register
);

router.post(
  '/login',
  loginValidationRules,
  validate,
  login
);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;