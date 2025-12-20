import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators';

export class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = registerSchema.parse(req.body);
            const user = await authService.register(data);

            res.status(201).json({
                success: true,
                message: 'User registered successfully.',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/login
     * Login user
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = loginSchema.parse(req.body);
            const result = await authService.login(data);

            res.json({
                success: true,
                message: 'Login successful.',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/me
     * Get current user profile
     */
    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const user = await authService.getMe(userId);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
