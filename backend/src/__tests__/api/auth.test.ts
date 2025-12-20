import request from 'supertest';
import { app } from '../../app';
import { testData } from '../setup';

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    tenantId: testData.tenantId,
                    email: 'newuser@test-clinic.com',
                    password: 'password123',
                    name: 'New User',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('newuser@test-clinic.com');
            expect(res.body.data).not.toHaveProperty('password');
        });

        it('should reject duplicate email in same tenant', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    tenantId: testData.tenantId,
                    email: 'admin@test-clinic.com', // Already exists
                    password: 'password123',
                    name: 'Duplicate',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    tenantId: testData.tenantId,
                    email: 'invalid-email',
                    password: 'password123',
                    name: 'Test',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(400);
        });

        it('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    tenantId: testData.tenantId,
                    email: 'short@test.com',
                    password: '123',
                    name: 'Test',
                    role: 'ADMIN',
                });

            expect(res.status).toBe(400);
        });

        it('should reject invalid role', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    tenantId: testData.tenantId,
                    email: 'role@test.com',
                    password: 'password123',
                    name: 'Test',
                    role: 'INVALID_ROLE',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test-clinic.com',
                    password: 'password123',
                    tenantSlug: testData.tenantSlug,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe('admin@test-clinic.com');

            testData.token = res.body.data.token;
        });

        it('should login as doctor', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'doctor@test-clinic.com',
                    password: 'password123',
                    tenantSlug: testData.tenantSlug,
                });

            expect(res.status).toBe(200);
            testData.doctorToken = res.body.data.token;
        });

        it('should login as pharmacist', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pharmacist@test-clinic.com',
                    password: 'password123',
                    tenantSlug: testData.tenantSlug,
                });

            expect(res.status).toBe(200);
            testData.pharmacistToken = res.body.data.token;
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test-clinic.com',
                    password: 'wrongpassword',
                    tenantSlug: testData.tenantSlug,
                });

            expect(res.status).toBe(401);
        });

        it('should reject non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123',
                    tenantSlug: testData.tenantSlug,
                });

            expect(res.status).toBe(401);
        });

        it('should reject non-existent tenant', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test-clinic.com',
                    password: 'password123',
                    tenantSlug: 'non-existent-clinic',
                });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('admin@test-clinic.com');
        });

        it('should reject request without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
        });

        it('should reject invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
        });
    });
});
