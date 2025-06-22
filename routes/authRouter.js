import express from 'express';
import * as authController from '../controllers/authController.js';
import validateBody from '../helpers/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js'; // loginSchema for future use
import authenticate from '../middleware/authenticate.js'; // Moved import to top

const authRouter = express.Router();

// User registration
authRouter.post('/register', validateBody(registerSchema), authController.register);

// User login (controller to be fully implemented later)
authRouter.post('/login', validateBody(loginSchema), authController.login);

// User logout
// The authenticate middleware will run first, then authController.logout
authRouter.post('/logout', authenticate, authController.logout);

// Get current user
authRouter.get('/current', authenticate, authController.getCurrentUser);

export default authRouter;
