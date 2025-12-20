import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../services/tenant.service';
import { createTenantSchema } from '../utils/validators';

export class TenantController {
    /**
     * POST /api/tenants
     * Create a new clinic
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = createTenantSchema.parse(req.body);
            const tenant = await tenantService.create(data);

            res.status(201).json({
                success: true,
                message: 'Clinic created successfully.',
                data: tenant,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/tenants/:slug
     * Get clinic by slug
     */
    async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { slug } = req.params;
            const tenant = await tenantService.getBySlug(slug);

            res.json({
                success: true,
                data: tenant,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const tenantController = new TenantController();
