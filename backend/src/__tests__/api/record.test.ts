import request from 'supertest';
import { app } from '../../app';
import { testData } from '../setup';

describe('Medical Record API', () => {
    describe('POST /api/:tenant/records', () => {
        it('should create a new SOAP medical record (as doctor)', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/records`)
                .set('Authorization', `Bearer ${testData.doctorToken}`)
                .send({
                    patientId: testData.patientId,
                    subjective: 'Patient complains of headache',
                    objective: 'Temperature 37.5°C, BP 120/80',
                    assessment: 'Common cold',
                    plan: 'Rest and paracetamol',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.subjective).toBe('Patient complains of headache');

            testData.recordId = res.body.data.id;
        });

        it('should reject record creation for non-existent patient', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/records`)
                .set('Authorization', `Bearer ${testData.doctorToken}`)
                .send({
                    patientId: 'non-existent-patient',
                    subjective: 'Test',
                });

            expect(res.status).toBe(404);
        });

        it('should allow record with partial SOAP data', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/records`)
                .set('Authorization', `Bearer ${testData.doctorToken}`)
                .send({
                    patientId: testData.patientId,
                    subjective: 'Follow-up visit',
                });

            expect(res.status).toBe(201);
        });
    });

    describe('GET /api/:tenant/records/:id', () => {
        it('should get medical record by ID', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/records/${testData.recordId}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(testData.recordId);
        });

        it('should return 404 for non-existent record', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/records/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/:tenant/patients/:id/records', () => {
        it('should get all records for a patient', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients/${testData.patientId}/records`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
});
