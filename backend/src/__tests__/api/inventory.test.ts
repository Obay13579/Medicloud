import request from 'supertest';
import { app } from '../../app';
import { testData } from '../setup';

describe('Inventory API', () => {
    describe('POST /api/:tenant/inventory', () => {
        it('should add a new drug to inventory', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/inventory`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({
                    name: 'Paracetamol 500mg',
                    stock: 100,
                    unit: 'tablet',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Paracetamol 500mg');
            expect(res.body.data.stock).toBe(100);

            testData.drugId = res.body.data.id;
        });

        it('should reject drug with negative stock', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/inventory`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({
                    name: 'Invalid Drug',
                    stock: -10,
                    unit: 'tablet',
                });

            expect(res.status).toBe(400);
        });

        it('should reject drug without name', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/inventory`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({
                    name: '',
                    stock: 10,
                    unit: 'tablet',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/:tenant/inventory', () => {
        it('should list all drugs in inventory', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/inventory`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should search drugs by name', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/inventory?search=Paracetamol`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /api/:tenant/inventory/:id', () => {
        it('should update drug stock', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/inventory/${testData.drugId}`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({ stock: 150 });

            expect(res.status).toBe(200);
            expect(res.body.data.stock).toBe(150);
        });

        it('should reject negative stock', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/inventory/${testData.drugId}`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({ stock: -5 });

            expect(res.status).toBe(400);
        });

        it('should return 404 for non-existent drug', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/inventory/non-existent-id`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({ stock: 10 });

            expect(res.status).toBe(404);
        });
    });
});
