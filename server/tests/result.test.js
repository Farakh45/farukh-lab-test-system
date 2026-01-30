process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-ci';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const LabResult = require('../models/LabResult');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

const getToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET || 'test-secret-key-for-ci',
    { expiresIn: '7d' }
  );
};

describe('Results API', () => {
  let technicianUser;
  let doctorUser;
  let adminUser;
  let techToken;
  let doctorToken;
  let adminToken;

  beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farukh-lab-results-test';
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
      await LabResult.deleteMany({});
      await mongoose.connection.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 30000);

  beforeEach(async () => {
    await LabResult.deleteMany({});
    await User.deleteMany({ email: { $regex: /^result-test-/ } });

    technicianUser = await User.create({
      name: 'Tech User',
      email: `result-test-tech-${Date.now()}@example.com`,
      password: 'password123',
      role: 'lab_technician'
    });
    doctorUser = await User.create({
      name: 'Doctor User',
      email: `result-test-doc-${Date.now()}@example.com`,
      password: 'password123',
      role: 'doctor'
    });
    adminUser = await User.create({
      name: 'Admin User',
      email: `result-test-admin-${Date.now()}@example.com`,
      password: 'password123',
      role: 'admin'
    });

    techToken = getToken(technicianUser);
    doctorToken = getToken(doctorUser);
    adminToken = getToken(adminUser);

    await new Promise(resolve => setTimeout(resolve, 50));
  }, 30000);

  describe('POST /api/results', () => {
    it('should create result with status Pending (lab_technician only)', async () => {
      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          patientName: 'John Doe',
          testType: 'CBC',
          resultValue: '12.5',
          unit: 'g/dL',
          referenceRange: '12-16'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBeDefined();
      expect(response.body.data.result.status).toBe('Pending');
      expect(response.body.data.result.patientName).toBe('John Doe');
    });

    it('should reject create when not lab_technician', async () => {
      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientName: 'Jane Doe',
          testType: 'Glucose',
          resultValue: '95'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/results', () => {
    it('lab_technician sees only own results', async () => {
      await LabResult.create({
        patientName: 'Patient A',
        testType: 'CBC',
        resultValue: '14',
        status: 'Pending',
        uploadedBy: technicianUser._id
      });
      await LabResult.create({
        patientName: 'Patient B',
        testType: 'Glucose',
        resultValue: '100',
        status: 'Pending',
        uploadedBy: doctorUser._id
      });

      const response = await request(app)
        .get('/api/results')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.results.length).toBe(1);
      expect(response.body.data.results[0].patientName).toBe('Patient A');
    });

    it('admin sees all results', async () => {
      await LabResult.create({
        patientName: 'Patient A',
        testType: 'CBC',
        resultValue: '14',
        status: 'Pending',
        uploadedBy: technicianUser._id
      });

      const response = await request(app)
        .get('/api/results')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/results/:id/status', () => {
    it('doctor can set Pending to Reviewed', async () => {
      const result = await LabResult.create({
        patientName: 'Patient X',
        testType: 'CBC',
        resultValue: '13',
        status: 'Pending',
        uploadedBy: technicianUser._id
      });

      const response = await request(app)
        .patch(`/api/results/${result._id}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'Reviewed' });

      expect(response.status).toBe(200);
      expect(response.body.data.result.status).toBe('Reviewed');
    });

    it('doctor cannot set Reviewed to Approved', async () => {
      const result = await LabResult.create({
        patientName: 'Patient Y',
        testType: 'Glucose',
        resultValue: '90',
        status: 'Reviewed',
        uploadedBy: technicianUser._id,
        reviewedBy: doctorUser._id
      });

      const response = await request(app)
        .patch(`/api/results/${result._id}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'Approved' });

      expect(response.status).toBe(403);
    });

    it('admin can set Reviewed to Approved', async () => {
      const result = await LabResult.create({
        patientName: 'Patient Z',
        testType: 'CBC',
        resultValue: '14',
        status: 'Reviewed',
        uploadedBy: technicianUser._id,
        reviewedBy: doctorUser._id
      });

      const response = await request(app)
        .patch(`/api/results/${result._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Approved' });

      expect(response.status).toBe(200);
      expect(response.body.data.result.status).toBe('Approved');
    });

    it('admin cannot approve Pending directly', async () => {
      const result = await LabResult.create({
        patientName: 'Patient W',
        testType: 'CBC',
        resultValue: '15',
        status: 'Pending',
        uploadedBy: technicianUser._id
      });

      const response = await request(app)
        .patch(`/api/results/${result._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Approved' });

      expect(response.status).toBe(400);
    });
  });
});
