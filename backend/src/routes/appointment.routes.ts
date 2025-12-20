import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateTenant } from '../middlewares/tenant.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication and tenant validation
router.use(authenticate);
router.use(validateTenant);

/**
 * @route   GET /api/:tenant/appointments
 * @desc    List appointments with filters (date, doctorId, status)
 * @access  Private
 */
router.get('/', appointmentController.getAll.bind(appointmentController));

/**
 * @route   POST /api/:tenant/appointments
 * @desc    Create new appointment
 * @access  Private
 */
router.post('/', appointmentController.create.bind(appointmentController));

/**
 * @route   GET /api/:tenant/appointments/:id
 * @desc    Get appointment detail
 * @access  Private
 */
router.get('/:id', appointmentController.getById.bind(appointmentController));

/**
 * @route   PATCH /api/:tenant/appointments/:id
 * @desc    Update appointment (status, date, timeSlot)
 * @access  Private
 */
router.patch('/:id', appointmentController.update.bind(appointmentController));

/**
 * @route   DELETE /api/:tenant/appointments/:id
 * @desc    Cancel appointment
 * @access  Private
 */
router.delete('/:id', appointmentController.delete.bind(appointmentController));

export default router;
