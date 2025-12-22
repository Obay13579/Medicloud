import { prisma } from '../app';
import { BadRequestError } from '../middlewares/error.middleware';
import bcrypt from 'bcryptjs';

interface CreateUserInput {
    email: string;
    password: string;
    name: string;
    role: 'DOCTOR' | 'PHARMACIST';
}

export class UserService {
    /**
     * Get all users for a tenant (with optional role filter)
     */
    async getAll(tenantId: string, role?: string) {
        const where: { tenantId: string; role?: string } = { tenantId };

        if (role) {
            where.role = role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return users;
    }

    /**
     * Create a new staff user (Doctor or Pharmacist)
     */
    async createStaff(tenantId: string, data: CreateUserInput) {
        // Check if email already exists for this tenant
        const existingUser = await prisma.user.findUnique({
            where: {
                tenantId_email: {
                    tenantId,
                    email: data.email,
                },
            },
        });

        if (existingUser) {
            throw new BadRequestError('Email sudah terdaftar di klinik ini.');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                tenantId,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return user;
    }
}

export const userService = new UserService();
