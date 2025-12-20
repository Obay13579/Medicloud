import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';
import { createAppointmentSchema, updateAppointmentSchema } from '../utils/validators';

export class AppointmentController {
    /**
     * GET /api/:tenant/appointments
     * List appointments with filters
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const filters = {
                date: req.query.date as string | undefined,
                doctorId: req.query.doctorId as string | undefined,
                status: req.query.status as string | undefined,
            };

            const appointments = await appointmentService.getAll(tenantId, filters);

            res.json({
                success: true,
                data: appointments,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/:tenant/appointments
     * Create new appointment
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const data = createAppointmentSchema.parse(req.body);

            const appointment = await appointmentService.create(tenantId, data);

            res.status(201).json({
                success: true,
                message: 'Appointment created successfully.',
                data: appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/:tenant/appointments/:id
     * Get appointment detail
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;

            const appointment = await appointmentService.getById(tenantId, id);

            res.json({
                success: true,
                data: appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/:tenant/appointments/:id
     * Update appointment
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;
            const data = updateAppointmentSchema.parse(req.body);

            const appointment = await appointmentService.update(tenantId, id, data);

            res.json({
                success: true,
                message: 'Appointment updated successfully.',
                data: appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/:tenant/appointments/:id
     * Cancel appointment
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = req.tenant!.id;
            const { id } = req.params;

            const result = await appointmentService.delete(tenantId, id);

            res.json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const appointmentController = new AppointmentController();
