// Backend route tests - integration tests for API routes
// Tests for all API endpoints, authentication, error handling

const request = require('supertest');
const app = require('../../backend/server');
const mongoose = require('mongoose');

describe('API Routes', () => {
  let authToken;
  let userId;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
  
  describe('Authentication Routes', () => {
    test('POST /api/auth/register should create user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'test123',
          name: 'Test User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
      userId = response.body.user.id;
    });
    
    test('POST /api/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
    
    test('GET /api/auth/me should return user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });
  });
  
  describe('Receipt Routes', () => {
    test('GET /api/receipts should require authentication', async () => {
      const response = await request(app).get('/api/receipts');
      expect(response.status).toBe(401);
    });
    
    test('GET /api/receipts should return receipts when authenticated', async () => {
      const response = await request(app)
        .get('/api/receipts')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.receipts)).toBe(true);
    });
  });
});

module.exports = {};
