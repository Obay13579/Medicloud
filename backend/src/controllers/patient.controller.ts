import { Request, Response, NextFunction } from 'express';
import { patientService } from '../services/patient.service';
import { createPatientSchema, updatePatientSchema } from '../utils/validators';

export class PatientController {
    /**
     * GET /api/:tenant/patients
     * List all patients
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const search = req.query.search as string | undefined;

            const patients = await patientService.getAll(tenantId, search);

            res.json({
                success: true,
                data: patients,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/:tenant/patients
     * Register new patient
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const data = createPatientSchema.parse(req.body);

            const patient = await patientService.create(tenantId, data);

            res.status(201).json({
                success: true,
                message: 'Patient registered successfully.',
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/:tenant/patients/:id
     * Get patient detail
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;

            const patient = await patientService.getById(tenantId, id);

            res.json({
                success: true,
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/:tenant/patients/:id
     * Update patient info
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;
            const data = updatePatientSchema.parse(req.body);

            const patient = await patientService.update(tenantId, id, data);

            res.json({
                success: true,
                message: 'Patient updated successfully.',
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/:tenant/patients/:id
     * Delete patient
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;

            const result = await patientService.delete(tenantId, id);

            res.json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const patientController = new PatientController();
