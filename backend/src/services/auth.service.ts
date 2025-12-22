import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { hashPassword, comparePassword } from '../utils/helpers';
import { RegisterInput, LoginInput } from '../utils/validators';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../middlewares/error.middleware';

export class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterInput) {
        // Check if tenant exists
        const tenant = await prisma.tenant.findUnique({
            where: { id: data.tenantId },
        });

        if (!tenant) {
            throw new NotFoundError('Tenant');
        }

        // Check if email already exists in this tenant
        const existingUser = await prisma.user.findUnique({
            where: {
                tenantId_email: {
                    tenantId: data.tenantId,
                    email: data.email,
                },
            },
        });

        if (existingUser) {
            throw new BadRequestError('Email already registered in this clinic.');
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                tenantId: data.tenantId,
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
                tenant: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                    },
                },
            },
        });

        return user;
    }

    /**
     * Login user and return JWT token
     */
    async login(data: LoginInput) {
        // Find tenant by slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: data.tenantSlug },
        });

        if (!tenant) {
            throw new NotFoundError('Clinic');
        }

        // Find user by email in this tenant
        const user = await prisma.user.findUnique({
            where: {
                tenantId_email: {
                    tenantId: tenant.id,
                    email: data.email,
                },
            },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid email or password.');
        }

        // Verify password
        const isValidPassword = await comparePassword(data.password, user.password);

        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid email or password.');
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(
            {
                userId: user.id,
                tenantId: user.tenantId,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            secret,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenant: {
                    id: tenant.id,
                    slug: tenant.slug,
                    name: tenant.name,
                },
            },
        };
    }

    /**
     * Get current user profile
     */
    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenant: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User');
        }

        return user;
    }
}

export const authService = new AuthService();
