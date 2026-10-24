
import { Router } from 'express';
import { UserController } from '../controllers/userController.ts';
import { validate } from '../middlewares/validate.ts';
import { registerSchema, loginSchema } from '../dtos/authSchema.ts';
import { authenticate } from '../middlewares/auth.ts';

const authRouter = Router();
const userController = new UserController();

authRouter.post(
  '/register',
  validate(registerSchema, 'body'),
  userController.register
);

authRouter.post(
  '/login',
  validate(loginSchema, 'body'),
  userController.login
);

authRouter.get('/me', authenticate, userController.getMe);
export { authRouter };
