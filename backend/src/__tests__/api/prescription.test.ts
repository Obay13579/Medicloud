import request from 'supertest';
import { app } from '../../app';
import { testData } from '../setup';

describe('Prescription API', () => {
    describe('POST /api/:tenant/prescriptions', () => {
        it('should create a prescription (as doctor)', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/prescriptions`)
                .set('Authorization', `Bearer ${testData.doctorToken}`)
                .send({
                    recordId: testData.recordId,
                    items: [
                        {
                            drugName: 'Paracetamol',
                            dosage: '500mg',
                            frequency: '3x daily',
                            duration: '5 days',
                        },
                    ],
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('PENDING');

            testData.prescriptionId = res.body.data.id;
        });

        it('should reject prescription with non-existent record', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/prescriptions`)
                .set('Authorization', `Bearer ${testData.doctorToken}`)
                .send({
                    recordId: 'non-existent-record',
                    items: [{ drugName: 'Test', dosage: '1mg', frequency: '1x' }],
                });

            expect(res.status).toBe(404);
        });

        it('should reject prescription with empty items', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/prescriptions`)
                .set('Authorization', `Bearer ${testData.doctorToken}`)
                .send({
                    recordId: testData.recordId,
                    items: [],
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/:tenant/prescriptions', () => {
        it('should list all prescriptions', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/prescriptions`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should filter by status PENDING', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/prescriptions?status=PENDING`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/:tenant/prescriptions/:id', () => {
        it('should get prescription by ID', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/prescriptions/${testData.prescriptionId}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(testData.prescriptionId);
        });

        it('should return 404 for non-existent prescription', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/prescriptions/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/:tenant/prescriptions/:id', () => {
        it('should update prescription status to PROCESSING (as pharmacist)', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/prescriptions/${testData.prescriptionId}`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({ status: 'PROCESSING' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('PROCESSING');
        });

        it('should update prescription status to COMPLETED', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/prescriptions/${testData.prescriptionId}`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({ status: 'COMPLETED' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('COMPLETED');
        });

        it('should reject invalid status', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/prescriptions/${testData.prescriptionId}`)
                .set('Authorization', `Bearer ${testData.pharmacistToken}`)
                .send({ status: 'INVALID_STATUS' });

            expect(res.status).toBe(400);
        });
    });
});
