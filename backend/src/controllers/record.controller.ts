import { Request, Response, NextFunction } from 'express';
import { recordService } from '../services/record.service';
import { createRecordSchema } from '../utils/validators';

export class RecordController {
    /**
     * GET /api/:tenant/patients/:id/records
     * Get patient's medical history
     */
    async getByPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const patientId = req.params.id;

            const records = await recordService.getByPatient(tenantId, patientId);

            res.json({
                success: true,
                data: records,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/:tenant/records
     * Create new SOAP record
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const doctorId = req.user!.id;
            const data = createRecordSchema.parse(req.body);

            const record = await recordService.create(tenantId, doctorId, data);

            res.status(201).json({
                success: true,
                message: 'Medical record created successfully.',
                data: record,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/:tenant/records/:id
     * Get record detail
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;

            const record = await recordService.getById(tenantId, id);

            res.json({
                success: true,
                data: record,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const recordController = new RecordController();
