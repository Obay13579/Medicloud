import { prisma } from '../app';
import { CreatePrescriptionInput, UpdatePrescriptionStatusInput } from '../utils/validators';
import { NotFoundError } from '../middlewares/error.middleware';

export class PrescriptionService {
    /**
     * Get all prescriptions for a tenant with optional status filter
     */
    async getAll(tenantId: string, status?: string) {
        const prescriptions = await prisma.prescription.findMany({
            where: {
                tenantId,
                ...(status && { status }),
            },
            include: {
                record: {
                    select: {
                        id: true,
                        visitDate: true,
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
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return prescriptions;
    }

    /**
     * Create a new prescription
     */
    async create(tenantId: string, data: CreatePrescriptionInput) {
        // Verify medical record exists
        const record = await prisma.medicalRecord.findFirst({
            where: { id: data.recordId, tenantId },
        });

        if (!record) {
            throw new NotFoundError('Medical record');
        }

        const prescription = await prisma.prescription.create({
            data: {
                tenantId,
                recordId: data.recordId,
                status: 'PENDING',
                items: data.items,
            },
            include: {
                record: {
                    select: {
                        id: true,
                        visitDate: true,
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
                },
            },
        });

        return prescription;
    }

    /**
     * Get prescription by ID
     */
    async getById(tenantId: string, id: string) {
        const prescription = await prisma.prescription.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                record: {
                    select: {
                        id: true,
                        visitDate: true,
                        subjective: true,
                        objective: true,
                        assessment: true,
                        plan: true,
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
                },
            },
        });

        if (!prescription) {
            throw new NotFoundError('Prescription');
        }

        return prescription;
    }

    /**
     * Update prescription status
     */
    async updateStatus(tenantId: string, id: string, data: UpdatePrescriptionStatusInput) {
        // Verify prescription exists
        await this.getById(tenantId, id);

        const prescription = await prisma.prescription.update({
            where: { id },
            data: {
                status: data.status,
            },
            include: {
                record: {
                    select: {
                        id: true,
                        patient: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return prescription;
    }
}

export const prescriptionService = new PrescriptionService();
