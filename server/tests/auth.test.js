process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-ci';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getMongoUriForTest } = require('./mongoTestHelper');

jest.setTimeout(30000);

describe('Auth API', () => {
  beforeAll(async () => {
    const mongoURI = await getMongoUriForTest();
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
      await mongoose.connection.db.admin().ping();
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    try {
      await User.deleteMany({});
      await mongoose.connection.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 30000);

  beforeEach(async () => {
    try {
      await User.deleteMany({ email: { $regex: /^(test-|test@example\.com$)/ } });
    } catch (error) {
      console.error('Cleanup error in beforeEach:', error);
    }
  }, 30000);

  describe('POST /api/auth/register', () => {
    it('should register a new user with lab_technician role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Technician',
          email: 'test@example.com',
          password: 'password123',
          role: 'lab_technician'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.role).toBe('lab_technician');
      expect(response.body.data.token).toBeDefined();
    });

    it('should register with doctor role', async () => {
      const email = `test-${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Doctor',
          email,
          password: 'password123',
          role: 'doctor'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe('doctor');
    });

    it('should not register with duplicate email', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: testEmail,
          password: 'password123',
          role: 'lab_technician'
        });
      expect((await request(app).post('/api/auth/register').send({
        name: 'Second User',
        email: testEmail,
        password: 'password123',
        role: 'doctor'
      })).status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.deleteMany({ email: 'login-test@example.com' });
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: 'login-test@example.com',
          password: 'password123',
          role: 'lab_technician'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Profile User',
          email: `profile-${Date.now()}@example.com`,
          password: 'password123',
          role: 'admin'
        });
      const token = reg.body.data.token;
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.role).toBe('admin');
    });
  });
});
