import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateTenant } from '../middlewares/tenant.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication and tenant validation
router.use(authenticate);
router.use(validateTenant);

/**
 * @route   GET /api/:tenant/inventory
 * @desc    List all drugs
 * @access  Private
 */
router.get('/', inventoryController.getAll.bind(inventoryController));

/**
 * @route   POST /api/:tenant/inventory
 * @desc    Add new drug
 * @access  Private (Pharmacist only)
 */
router.post('/', authorize('PHARMACIST', 'ADMIN'), inventoryController.create.bind(inventoryController));

/**
 * @route   PATCH /api/:tenant/inventory/:id
 * @desc    Update drug stock
 * @access  Private (Pharmacist only)
 */
router.patch('/:id', authorize('PHARMACIST', 'ADMIN'), inventoryController.updateStock.bind(inventoryController));

export default router;
