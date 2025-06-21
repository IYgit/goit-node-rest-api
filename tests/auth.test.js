import request from 'supertest';
import app from '../app.js'; // The Express app
import sequelize from '../db/sequelize.js'; // The Sequelize instance
import models from '../models/index.js'; // To access User model for cleanup

const { User } = models;

describe('Auth Endpoints', () => {
  // Before all tests, sync the DB (if using sqlite in-memory for tests, or ensure test DB is clean)
  // For this project, we assume the test DB is configured and migrations have run.
  // We'll clear relevant tables before each test suite or test.
  beforeAll(async () => {
    // It's often better to run migrations programmatically here or ensure a clean state.
    // For now, we'll just ensure tables are empty.
    // await sequelize.sync({ force: true }); // This would drop and recreate all tables, good for isolated tests
    // If using an existing migrated DB, just clean up:
    if (process.env.NODE_ENV === 'test') {
        await User.destroy({ truncate: true, cascade: true }); // Clear users table before tests
    }
  });

  // After all tests, close DB connection
  afterAll(async () => {
    await sequelize.close();
  });

  // Clean up users after each test to ensure independence
  afterEach(async () => {
    if (process.env.NODE_ENV === 'test') {
        await User.destroy({ truncate: true, cascade: true });
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('subscription', 'starter');
    });

    it('should return 409 if email is already in use', async () => {
      // First, register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'conflict@example.com',
          password: 'password123',
        });

      // Attempt to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'conflict@example.com',
          password: 'password456',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Email in use');
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
        });
      expect(res.statusCode).toEqual(400);
      // Message might vary based on Joi's output, check for a relevant part
      expect(res.body.message).toContain('Email is required');
    });

    it('should return 400 for missing password', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('Password is required');
    });

     it('should return 400 for password too short', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'shortpass@example.com',
            password: '123',
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    const userCredentials = {
      email: 'loginuser@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Register a user to log in with
      await request(app)
        .post('/api/auth/register')
        .send(userCredentials);
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(userCredentials);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userCredentials.email);
      expect(res.body.user).toHaveProperty('subscription', 'starter');

      // Verify token is stored in DB for this user
      const dbUser = await User.findOne({ where: { email: userCredentials.email }});
      expect(dbUser.token).toEqual(res.body.token);
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Email or password invalid');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nouser@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Email or password invalid');
    });

    it('should return 400 for missing email on login', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            password: 'password123',
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('Email is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    const userCredentials = {
      email: 'logoutuser@example.com',
      password: 'password123',
    };
    let userToken = '';

    beforeEach(async () => {
      // Register and login user to get a token
      await request(app)
        .post('/api/auth/register')
        .send(userCredentials);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send(userCredentials);
      userToken = loginRes.body.token;
    });

    it('should logout an authenticated user successfully (204)', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(204);

      // Verify token is cleared in DB
      const dbUser = await User.findOne({ where: { email: userCredentials.email } });
      expect(dbUser.token).toBeNull();
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/auth/logout');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('No Authorization header');
    });

    it('should return 401 if token is invalid/expired', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toEqual(401);
      // The message could be from jwt.verify (e.g., "jwt malformed", "invalid signature")
      // or our custom "User not found or token invalid/revoked"
      expect(res.body.message).toBeDefined();
    });

    it('logged out token should not be usable for protected routes', async () => {
      // Logout the user first
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`);

      // Attempt to access a protected route (e.g., GET /api/contacts) with the old token
      // Assuming /api/contacts is a protected route from previous steps
      const res = await request(app)
        .get('/api/contacts') // A known protected route
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(401);
      // Specific message depends on authenticate middleware logic when user.token is null but token was validly decoded
      expect(res.body.message).toContain('User not found or token invalid/revoked');
    });
  });

  describe('GET /api/auth/current', () => {
    const userCredentials = {
      email: 'currentuser@example.com',
      password: 'password123',
      subscription: 'starter', // Default subscription
    };
    let userToken = '';

    beforeEach(async () => {
      // Register and login user to get a token
      await request(app)
        .post('/api/auth/register')
        .send({ email: userCredentials.email, password: userCredentials.password });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userCredentials.email, password: userCredentials.password });
      userToken = loginRes.body.token;
    });

    it('should return current user details for an authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        email: userCredentials.email,
        subscription: userCredentials.subscription,
      });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/current');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('No Authorization header');
    });

    it('should return 401 if token is invalid/expired', async () => {
      const res = await request(app)
        .get('/api/auth/current')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBeDefined(); // Message can vary (e.g., "jwt malformed", "invalid signature")
    });

    it('should return 401 if token is valid but user is not found (e.g., deleted after token issuance)', async () => {
      // Create and login a user
      const tempUserCreds = { email: 'tempuser@example.com', password: 'password123' };
      await request(app).post('/api/auth/register').send(tempUserCreds);
      const loginRes = await request(app).post('/api/auth/login').send(tempUserCreds);
      const tempToken = loginRes.body.token;

      // Delete the user from DB directly
      await User.destroy({ where: { email: tempUserCreds.email } });

      // Attempt to get current user with the now orphaned token
      const res = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${tempToken}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('User not found or token invalid/revoked');
    });
  });
});
