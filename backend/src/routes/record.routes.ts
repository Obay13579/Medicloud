import { Router } from 'express';
import { recordController } from '../controllers/record.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateTenant } from '../middlewares/tenant.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication and tenant validation
router.use(authenticate);
router.use(validateTenant);

/**
 * @route   POST /api/:tenant/records
 * @desc    Create new SOAP medical record
 * @access  Private (Doctor only)
 */
router.post('/', authorize('DOCTOR'), recordController.create.bind(recordController));

/**
 * @route   GET /api/:tenant/records/:id
 * @desc    Get medical record detail
 * @access  Private
 */
router.get('/:id', recordController.getById.bind(recordController));

export default router;
