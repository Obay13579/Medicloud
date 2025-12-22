import { prisma } from '../app';
import { CreateRecordInput } from '../utils/validators';
import { NotFoundError } from '../middlewares/error.middleware';

export class RecordService {
    /**
     * Get all medical records for a patient
     */
    async getByPatient(tenantId: string, patientId: string) {
        // Verify patient exists
        const patient = await prisma.patient.findFirst({
            where: { id: patientId, tenantId },
        });

        if (!patient) {
            throw new NotFoundError('Patient');
        }

        const records = await prisma.medicalRecord.findMany({
            where: {
                tenantId,
                patientId,
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                prescriptions: {
                    select: {
                        id: true,
                        status: true,
                        items: true,
                    },
                },
            },
            orderBy: { visitDate: 'desc' },
        });

        return records;
    }

    /**
     * Create a new medical record (SOAP)
     */
    async create(tenantId: string, doctorId: string, data: CreateRecordInput) {
        // Verify patient exists
        const patient = await prisma.patient.findFirst({
            where: { id: data.patientId, tenantId },
        });

        if (!patient) {
            throw new NotFoundError('Patient');
        }

        const record = await prisma.medicalRecord.create({
            data: {
                tenantId,
                patientId: data.patientId,
                doctorId,
                subjective: data.subjective,
                objective: data.objective,
                assessment: data.assessment,
                plan: data.plan,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
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

        return record;
    }

    /**
     * Get medical record by ID
     */
    async getById(tenantId: string, id: string) {
        const record = await prisma.medicalRecord.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        dob: true,
                        gender: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                prescriptions: {
                    select: {
                        id: true,
                        status: true,
                        items: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!record) {
            throw new NotFoundError('Medical record');
        }

        return record;
    }
}

export const recordService = new RecordService();
