import { prisma } from '../app';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../utils/validators';
import { NotFoundError } from '../middlewares/error.middleware';
import { getStartOfDay, getEndOfDay } from '../utils/helpers';

interface AppointmentFilters {
    date?: string;
    doctorId?: string;
    status?: string;
}

export class AppointmentService {
    /**
     * Get all appointments for a tenant with filters
     */
    async getAll(tenantId: string, filters: AppointmentFilters = {}) {
        const { date, doctorId, status } = filters;

        const appointments = await prisma.appointment.findMany({
            where: {
                tenantId,
                ...(date && {
                    date: {
                        gte: getStartOfDay(date),
                        lte: getEndOfDay(date),
                    },
                }),
                ...(doctorId && { doctorId }),
                ...(status && { status }),
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { date: 'asc' },
                { timeSlot: 'asc' },
            ],
        });

        return appointments;
    }

    /**
     * Create a new appointment
     */
    async create(tenantId: string, data: CreateAppointmentInput) {
        // Verify patient exists
        const patient = await prisma.patient.findFirst({
            where: { id: data.patientId, tenantId },
        });

        if (!patient) {
            throw new NotFoundError('Patient');
        }

        // Verify doctor exists and is a doctor
        const doctor = await prisma.user.findFirst({
            where: { id: data.doctorId, tenantId, role: 'DOCTOR' },
        });

        if (!doctor) {
            throw new NotFoundError('Doctor');
        }

        const appointment = await prisma.appointment.create({
            data: {
                tenantId,
                patientId: data.patientId,
                doctorId: data.doctorId,
                date: new Date(data.date),
                timeSlot: data.timeSlot,
                status: 'SCHEDULED',
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return appointment;
    }

    /**
     * Get appointment by ID
     */
    async getById(tenantId: string, id: string) {
        const appointment = await prisma.appointment.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        dob: true,
                        gender: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!appointment) {
            throw new NotFoundError('Appointment');
        }

        return appointment;
    }

    /**
     * Update appointment
     */
    async update(tenantId: string, id: string, data: UpdateAppointmentInput) {
        // Verify appointment exists and belongs to tenant
        await this.getById(tenantId, id);

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                ...(data.date && { date: new Date(data.date) }),
                ...(data.timeSlot && { timeSlot: data.timeSlot }),
                ...(data.status && { status: data.status }),
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return appointment;
    }

    /**
     * Delete (cancel) appointment
     */
    async delete(tenantId: string, id: string) {
        // Verify appointment exists and belongs to tenant
        await this.getById(tenantId, id);

        await prisma.appointment.delete({
            where: { id },
        });

        return { message: 'Appointment cancelled successfully.' };
    }
}

export const appointmentService = new AppointmentService();
