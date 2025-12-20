import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateTenant } from '../middlewares/tenant.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication and tenant validation
router.use(authenticate);
router.use(validateTenant);

/**
 * @route   GET /api/:tenant/prescriptions
 * @desc    List prescriptions with optional status filter
 * @access  Private
 */
router.get('/', prescriptionController.getAll.bind(prescriptionController));

/**
 * @route   POST /api/:tenant/prescriptions
 * @desc    Create new prescription
 * @access  Private (Doctor only)
 */
router.post('/', authorize('DOCTOR'), prescriptionController.create.bind(prescriptionController));

/**
 * @route   GET /api/:tenant/prescriptions/:id
 * @desc    Get prescription detail
 * @access  Private
 */
router.get('/:id', prescriptionController.getById.bind(prescriptionController));

/**
 * @route   PATCH /api/:tenant/prescriptions/:id
 * @desc    Update prescription status
 * @access  Private (Pharmacist only)
 */
router.patch('/:id', authorize('PHARMACIST'), prescriptionController.updateStatus.bind(prescriptionController));

export default router;
