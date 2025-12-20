import { Request, Response, NextFunction } from 'express';
import { prescriptionService } from '../services/prescription.service';
import { createPrescriptionSchema, updatePrescriptionStatusSchema } from '../utils/validators';

export class PrescriptionController {
    /**
     * GET /api/:tenant/prescriptions
     * List prescriptions with optional status filter
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const status = req.query.status as string | undefined;

            const prescriptions = await prescriptionService.getAll(tenantId, status);

            res.json({
                success: true,
                data: prescriptions,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/:tenant/prescriptions
     * Create new prescription
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const data = createPrescriptionSchema.parse(req.body);

            const prescription = await prescriptionService.create(tenantId, data);

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully.',
                data: prescription,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/:tenant/prescriptions/:id
     * Get prescription detail
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;

            const prescription = await prescriptionService.getById(tenantId, id);

            res.json({
                success: true,
                data: prescription,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/:tenant/prescriptions/:id
     * Update prescription status
     */
    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;
            const data = updatePrescriptionStatusSchema.parse(req.body);

            const prescription = await prescriptionService.updateStatus(tenantId, id, data);

            res.json({
                success: true,
                message: 'Prescription status updated successfully.',
                data: prescription,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const prescriptionController = new PrescriptionController();
