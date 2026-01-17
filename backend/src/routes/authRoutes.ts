import { Router } from 'express';
import { authController } from '../controllers';
import { validate, validateLogin, authMiddleware } from '../middlewares';

const router = Router();

router.post('/login', validate(validateLogin), authController.login);
router.get('/me', authMiddleware, authController.me);

export default router;
