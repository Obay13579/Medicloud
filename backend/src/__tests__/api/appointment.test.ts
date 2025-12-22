import request from 'supertest';
import { app } from '../../app';
import { testData } from '../setup';

describe('Appointment API', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    describe('POST /api/:tenant/appointments', () => {
        it('should create a new appointment', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/appointments`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    patientId: testData.patientId,
                    doctorId: testData.doctorId,
                    date: tomorrowStr,
                    timeSlot: '09:00-09:30',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('SCHEDULED');

            testData.appointmentId = res.body.data.id;
        });

        it('should reject appointment with non-existent patient', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/appointments`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    patientId: 'non-existent-patient',
                    doctorId: testData.doctorId,
                    date: tomorrowStr,
                    timeSlot: '10:00-10:30',
                });

            expect(res.status).toBe(404);
        });

        it('should reject invalid date format', async () => {
            const res = await request(app)
                .post(`/api/${testData.tenantSlug}/appointments`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    patientId: testData.patientId,
                    doctorId: testData.doctorId,
                    date: 'invalid-date',
                    timeSlot: '10:00-10:30',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/:tenant/appointments', () => {
        it('should list all appointments', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/appointments`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should filter by date', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/appointments?date=${tomorrowStr}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });

        it('should filter by doctorId', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/appointments?doctorId=${testData.doctorId}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });

        it('should filter by status', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/appointments?status=SCHEDULED`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/:tenant/appointments/:id', () => {
        it('should get appointment by ID', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/appointments/${testData.appointmentId}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(testData.appointmentId);
        });

        it('should return 404 for non-existent appointment', async () => {
            const res = await request(app)
                .get(`/api/${testData.tenantSlug}/appointments/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/:tenant/appointments/:id', () => {
        it('should update appointment status to CHECKED_IN', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/appointments/${testData.appointmentId}`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({ status: 'CHECKED_IN' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('CHECKED_IN');
        });

        it('should update appointment status to IN_PROGRESS', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/appointments/${testData.appointmentId}`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({ status: 'IN_PROGRESS' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('IN_PROGRESS');
        });

        it('should reject invalid status', async () => {
            const res = await request(app)
                .patch(`/api/${testData.tenantSlug}/appointments/${testData.appointmentId}`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({ status: 'INVALID_STATUS' });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/:tenant/appointments/:id', () => {
        it('should cancel an appointment', async () => {
            // Create appointment to delete
            const createRes = await request(app)
                .post(`/api/${testData.tenantSlug}/appointments`)
                .set('Authorization', `Bearer ${testData.token}`)
                .send({
                    patientId: testData.patientId,
                    doctorId: testData.doctorId,
                    date: tomorrowStr,
                    timeSlot: '14:00-14:30',
                });

            const res = await request(app)
                .delete(`/api/${testData.tenantSlug}/appointments/${createRes.body.data.id}`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(200);
        });

        it('should return 404 for non-existent appointment', async () => {
            const res = await request(app)
                .delete(`/api/${testData.tenantSlug}/appointments/non-existent-id`)
                .set('Authorization', `Bearer ${testData.token}`);

            expect(res.status).toBe(404);
        });
    });
});
