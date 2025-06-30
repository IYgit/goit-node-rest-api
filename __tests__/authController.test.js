import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app.js'; // шлях до вашого app.js
import User from '../models/user.js'; // шлях до моделі User
import sequelize from '../db/sequelize.js'; // шлях до екземпляру sequelize

describe('Auth API - Login', () => {
  let testUser;
  const testPassword = 'password123';

  beforeAll(async () => {
    // Переконуємося, що середовище тестове
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must be run with NODE_ENV=test');
    }
    // Синхронізація бази даних (створення таблиць, якщо їх немає)
    // Важливо: це може видалити існуючі дані, якщо використовувати { force: true }
    // Для тестів краще мати окрему тестову базу даних
    await sequelize.sync();

    // Видаляємо користувача, якщо він існує з попередніх тестів
    await User.destroy({ where: { email: 'testlogin@example.com' } });

    // Створюємо тестового користувача
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    testUser = await User.create({
      email: 'testlogin@example.com',
      password: hashedPassword,
      subscription: 'pro',
      avatarURL: 'http://example.com/avatar.jpg',
    });
  });

  afterAll(async () => {
    // Видаляємо тестового користувача
    if (testUser) {
      await User.destroy({ where: { id: testUser.id } });
    }
    // Закриваємо з'єднання з базою даних
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials and return 200 status', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: testPassword,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'testlogin@example.com');
      expect(typeof res.body.user.email).toBe('string');
      expect(res.body.user).toHaveProperty('subscription', 'pro');
      expect(typeof res.body.user.subscription).toBe('string');
      // Перевіряємо, чи токен валідний і містить правильні дані
      const decodedToken = jwt.verify(res.body.token, process.env.JWT_SECRET || 'default-super-secret-key-for-dev');
      expect(decodedToken.id).toEqual(testUser.id);
      expect(decodedToken.email).toEqual(testUser.email);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Email or password invalid');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Email or password invalid');
    });

    it('should return 400 if email is not provided', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                password: testPassword,
            });
        expect(res.statusCode).toEqual(400); // Або інший код помилки валідації, якщо є
        // Перевірка тіла відповіді може залежати від вашої middleware валідації
        // Наприклад: expect(res.body.message).toContain('email is required');
    });

    it('should return 400 if password is not provided', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testlogin@example.com',
            });
        expect(res.statusCode).toEqual(400); // Або інший код помилки валідації
        // Наприклад: expect(res.body.message).toContain('password is required');
    });
  });
});
