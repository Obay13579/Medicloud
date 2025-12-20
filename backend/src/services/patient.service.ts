import { prisma } from '../app';
import { CreatePatientInput, UpdatePatientInput } from '../utils/validators';
import { NotFoundError } from '../middlewares/error.middleware';

export class PatientService {
    /**
     * Get all patients for a tenant
     */
    async getAll(tenantId: string, search?: string) {
        const patients = await prisma.patient.findMany({
            where: {
                tenantId,
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                    ],
                }),
            },
            orderBy: { name: 'asc' },
        });

        return patients;
    }

    /**
     * Create a new patient
     */
    async create(tenantId: string, data: CreatePatientInput) {
        const patient = await prisma.patient.create({
            data: {
                tenantId,
                name: data.name,
                phone: data.phone,
                dob: new Date(data.dob),
                gender: data.gender,
            },
        });

        return patient;
    }

    /**
     * Get patient by ID
     */
    async getById(tenantId: string, id: string) {
        const patient = await prisma.patient.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                _count: {
                    select: {
                        appointments: true,
                        records: true,
                    },
                },
            },
        });

        if (!patient) {
            throw new NotFoundError('Patient');
        }

        return patient;
    }

    /**
     * Update patient
     */
    async update(tenantId: string, id: string, data: UpdatePatientInput) {
        // Verify patient exists and belongs to tenant
        await this.getById(tenantId, id);

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.phone && { phone: data.phone }),
                ...(data.dob && { dob: new Date(data.dob) }),
                ...(data.gender && { gender: data.gender }),
            },
        });

        return patient;
    }

    /**
     * Delete patient
     */
    async delete(tenantId: string, id: string) {
        // Verify patient exists and belongs to tenant
        await this.getById(tenantId, id);

        await prisma.patient.delete({
            where: { id },
        });

        return { message: 'Patient deleted successfully.' };
    }
}

export const patientService = new PatientService();
