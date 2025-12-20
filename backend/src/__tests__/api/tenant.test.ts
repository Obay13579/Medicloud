import request from 'supertest';
import { app } from '../../app';
import { testData, prisma } from '../setup';

describe('Tenant API', () => {
    const newTenantSlug = 'new-test-clinic-' + Date.now();

    describe('POST /api/tenants', () => {
        it('should create a new tenant successfully', async () => {
            const res = await request(app)
                .post('/api/tenants')
                .send({
                    name: 'New Test Clinic',
                    slug: newTenantSlug,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.slug).toBe(newTenantSlug);

            // Cleanup: delete the created tenant
            await prisma.tenant.delete({ where: { slug: newTenantSlug } });
        });

        it('should reject duplicate slug', async () => {
            const res = await request(app)
                .post('/api/tenants')
                .send({
                    name: 'Duplicate Clinic',
                    slug: testData.tenantSlug, // Already exists from setup
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject short slug', async () => {
            const res = await request(app)
                .post('/api/tenants')
                .send({
                    name: 'Test',
                    slug: 'ab',
                });

            expect(res.status).toBe(400);
        });

        it('should reject invalid slug format', async () => {
            const res = await request(app)
                .post('/api/tenants')
                .send({
                    name: 'Test Clinic',
                    slug: 'Invalid Slug With Spaces',
                });

            expect(res.status).toBe(400);
        });

        it('should reject slug with uppercase', async () => {
            const res = await request(app)
                .post('/api/tenants')
                .send({
                    name: 'Test Clinic',
                    slug: 'InvalidSlug',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/tenants/:slug', () => {
        it('should get tenant by slug', async () => {
            const res = await request(app)
                .get(`/api/tenants/${testData.tenantSlug}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.slug).toBe(testData.tenantSlug);
        });

        it('should return 404 for non-existent tenant', async () => {
            const res = await request(app)
                .get('/api/tenants/non-existent-clinic');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
