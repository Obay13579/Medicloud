import { prisma } from '../app';
import { CreateTenantInput } from '../utils/validators';
import { NotFoundError, BadRequestError } from '../middlewares/error.middleware';

export class TenantService {
    /**
     * Create a new tenant (clinic)
     */
    async create(data: CreateTenantInput) {
        // Check if slug already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug: data.slug },
        });

        if (existingTenant) {
            throw new BadRequestError('Clinic with this slug already exists.');
        }

        const tenant = await prisma.tenant.create({
            data: {
                name: data.name,
                slug: data.slug,
            },
        });

        return tenant;
    }

    /**
     * Get tenant by slug
     */
    async getBySlug(slug: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        users: true,
                        patients: true,
                    },
                },
            },
        });

        if (!tenant) {
            throw new NotFoundError('Clinic');
        }

        return tenant;
    }
}

export const tenantService = new TenantService();
