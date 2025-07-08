import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import User from '../models/user.js';
import HttpError from '../helpers/HttpError.js';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from "url";
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Перевіряємо чи користувач вже існує
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw HttpError(409, 'Email in use');
    }

    // Генеруємо URL аватара
    const avatarURL = gravatar.url(email, {
      s: '250',
      r: 'g',
      d: 'mp'
    }, true);

    // Генеруємо токен верифікації
    const verificationToken = uuidv4();

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створюємо нового користувача
    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
      verify: false,
    });

    // Формуємо посилання для верифікації
    const verificationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/verify/${verificationToken}`;

    // Відправляємо email
    await sendEmail({
      to: email,
      subject: 'Підтвердження email',
      html: `<p>Для підтвердження вашої електронної адреси перейдіть за посиланням: 
             <a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    if (!error.status) {
      console.error("Registration Error:", error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return next(HttpError(409, 'Email in use'));
      }
      return next(HttpError(500, "Internal Server Error"));
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // req.user is populated by the authenticate middleware
    const user = req.user;

    user.token = null; // Clear the token
    await user.save();

    res.status(204).send(); // Send 204 No Content
  } catch (error) {
    console.error("Logout Error:", error);
    next(HttpError(500, "Internal Server Error"));
    // Removed erroneous import from here
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const { email, subscription, avatarURL } = req.user;
    res.status(200).json({ email, subscription, avatarURL });
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    next(HttpError(500, "Internal Server Error"));
  }
};


// Login controller
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(401, 'Email or password invalid');
    }

    // Перевіряємо чи верифікований email
    if (!user.verify) {
      throw HttpError(401, 'Email not verified');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpError(401, 'Email or password invalid');
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-super-secret-key-for-dev'; // Default for dev if not set
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h'; // Default expiration

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // Store token in user record (or manage tokens separately if multiple logins/devices are supported)
    // For this implementation, we'll store the latest token on the user model.
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    if (!error.status) {
        console.error("Login Error:", error);
        return next(HttpError(500, "Internal Server Error"));
    }
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    /* 1. Перевірка наявності файла */
    if (!req.file) {
      throw HttpError(400, "Avatar file is required");
    }

    /* 2. Змінні: user.id та дані про файл */
    const { id } = req.user;                           // id поточного користувача (приходить із токена)
    const { path: tempUpload, originalname } = req.file; // шлях тимчасового файлу та оригінальне ім'я

    /* 3. Шляхи до каталогів */
    const publicDir  = path.join(__dirname, '../public');
    const avatarsDir = path.join(publicDir, 'avatars'); // …/public/avatars

    /* 4. Генеруємо унікальне ім’я файлу */
    const extension  = originalname.split('.').pop();   // png / jpg / …
    const filename   = `${id}_${Date.now()}.${extension}`;

    /* 5. Остаточний шлях, куди перемістимо файл */
    const resultUpload = path.join(avatarsDir, filename);

    /* 6. Переміщення (rename == move) файлу з tmp‑папки */
    await fs.rename(tempUpload, resultUpload);

    /* 7. Новий URL, що зберігатиметься в базі та віддаватиметься клієнту */
    const avatarURL = `/avatars/${filename}`;

    /* 8. Оновлення запису користувача (Sequelize) */
    await User.update(
        { avatarURL },
        { where: { id } }
    );

    /* 9. Відповідь клієнту */
    res.json({ avatarURL });
  } catch (error) {
    /* 10. Rollback: видаляємо тимчасовий файл, якщо він ще лежить у tmp‑директорії */
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error); // передаємо помилку глобальному error‑handler’у
  }
};


export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    // Шукаємо користувача за токеном верифікації
    const user = await User.findOne({
      where: {
        verificationToken
      }
    });

    // Якщо користувача не знайдено
    if (!user) {
      throw HttpError(404, 'User not found');
    }

    // Оновлюємо дані користувача
    await User.update(
        {
          verify: true,
          verificationToken: null
        },
        {
          where: { id: user.id }
        }
    );

    res.json({
      message: 'Verification successful'
    });

  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Знаходимо користувача за email
    const user = await User.findOne({ where: { email } });

    // Якщо користувача не знайдено
    if (!user) {
      throw HttpError(404, 'User not found');
    }

    // Перевіряємо чи користувач вже верифікований
    if (user.verify) {
      throw HttpError(400, 'Verification has already been passed');
    }

    // Якщо токен верифікації відсутній, генеруємо новий
    if (!user.verificationToken) {
      user.verificationToken = uuidv4();
      await user.save();
    }

    // Формуємо посилання для верифікації
    const verificationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/verify/${user.verificationToken}`;

    // Відправляємо email
    await sendEmail({
      to: email,
      subject: 'Підтвердження email',
      html: `<p>Для підтвердження вашої електронної адреси перейдіть за посиланням: 
             <a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    res.json({
      message: 'Verification email sent',
    });

  } catch (error) {
    next(error);
  }
};


