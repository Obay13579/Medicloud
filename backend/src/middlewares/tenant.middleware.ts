import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';

// Extend Express Request type for tenant
declare global {
    namespace Express {
        interface Request {
            tenant?: {
                id: string;
                slug: string;
                name: string;
            };
        }
    }
}

/**
 * Middleware to validate tenant from URL parameter and attach to request
 * Used for routes like /api/:tenant/patients
 */
export const validateTenant = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tenantSlug = req.params.tenant;

        if (!tenantSlug) {
            res.status(400).json({
                success: false,
                error: 'Tenant slug is required.',
            });
            return;
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            res.status(404).json({
                success: false,
                error: 'Tenant not found.',
            });
            return;
        }

        // If user is authenticated, verify they belong to this tenant
        if (req.user && req.user.tenantId !== tenant.id) {
            res.status(403).json({
                success: false,
                error: 'Access denied. You do not belong to this clinic.',
            });
            return;
        }

        req.tenant = {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name,
        };

        next();
    } catch (error) {
        next(error);
    }
};
