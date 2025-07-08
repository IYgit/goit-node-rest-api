import express from 'express';
import * as authController from '../controllers/authController.js';
import validateBody from '../helpers/validateBody.js';
import {registerSchema, loginSchema, emailSchema} from '../schemas/authSchemas.js';
import authenticate from '../middleware/authenticate.js';
import upload from '../middleware/upload.js';

const authRouter = express.Router();

// User registration
authRouter.post('/register', validateBody(registerSchema), authController.register);

// Email verification
authRouter.get('/verify/:verificationToken', authController.verifyEmail);

authRouter.post('/verify', validateBody(emailSchema), authController.resendVerificationEmail);

// User login
authRouter.post('/login', validateBody(loginSchema), authController.login);

// User logout
// The authenticate middleware will run first, then authController.logout
authRouter.post('/logout', authenticate, authController.logout);

// Get current user
authRouter.get('/current', authenticate, authController.getCurrentUser);

// Оновлення аватара
// 'avatar'— це назва поля у формі multipart/form-data, з якого Multer очікує отримати файл.
authRouter.patch('/avatars',  authenticate, upload.single('avatar'), authController.updateAvatar);

export default authRouter;
