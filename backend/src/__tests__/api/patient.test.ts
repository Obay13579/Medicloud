import request from 'supertest';
import { app } from '../../app';
import { testData } from '../setup';

describe('Patient API', () => {
    describe('GET /api/:tenant/patients', () => {
        it('should list all patients', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should search patients by name', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients?search=Test`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });

        it('should reject request without authentication', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients`);

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/:tenant/patients', () => {
        it('should create a new patient', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/patients`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    name: 'New Patient',
                    phone: '08111222333',
                    dob: '1985-05-20',
                    gender: 'FEMALE',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('New Patient');
        });

        it('should reject invalid date of birth', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/patients`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    name: 'Test',
                    phone: '08111222333',
                    dob: 'invalid-date',
                    gender: 'MALE',
                });

            expect(res.status).toBe(400);
        });

        it('should reject invalid gender', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/patients`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    name: 'Test',
                    phone: '08111222333',
                    dob: '1990-01-01',
                    gender: 'INVALID',
                });

            expect(res.status).toBe(400);
        });

        it('should reject short phone number', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/patients`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    name: 'Test',
                    phone: '123',
                    dob: '1990-01-01',
                    gender: 'MALE',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/:tenant/patients/:id', () => {
        it('should get patient by ID', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients/${testData.patientId}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testData.patientId);
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/:tenant/patients/:id', () => {
        it('should update patient info', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/patients/${testData.patientId}`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    name: 'Updated Patient Name',
                });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Updated Patient Name');
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/patients/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({ name: 'Test' });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/:tenant/patients/:id/records', () => {
        it('should get patient medical history', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients/${testData.patientId}/records`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/patients/non-existent-id/records`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /api/:tenant/patients/:id', () => {
        it('should delete patient', async () => {
            // Create a patient to delete
            const createRes = await request(app)
                .post(`/api/${testData.tenantSlug}/patients`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    name: 'Patient To Delete',
                    phone: '08999888777',
                    dob: '1980-01-01',
                    gender: 'MALE',
                });

            const patientToDeleteId = createRes.body.data.id;

            const res = await request(app)
                .delete(`/api/${testData.tenantSlug}/patients/${patientToDeleteId}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(app)
                .delete(`/api/${testData.tenantSlug}/patients/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });
});
