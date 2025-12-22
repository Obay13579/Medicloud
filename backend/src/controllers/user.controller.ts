import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { z } from 'zod';

const createStaffSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    role: z.enum(['DOCTOR', 'PHARMACIST'], {
        message: 'Role harus DOCTOR atau PHARMACIST',
    }),
});

export class UserController {
    /**
     * GET /api/:tenant/users
     * Get all users for a tenant (with optional role filter)
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const role = req.query.role as string | undefined;

            const users = await userService.getAll(tenantId, role);

            res.json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/:tenant/users
     * Create a new staff user (Doctor or Pharmacist)
     */
    async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const data = createStaffSchema.parse(req.body);

            const user = await userService.createStaff(tenantId, data);

            res.status(201).json({
                success: true,
                message: 'Staff berhasil ditambahkan.',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();
