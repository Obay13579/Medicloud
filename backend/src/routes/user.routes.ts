import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :tenant

/**
 * @route   GET /api/:tenant/users
 * @desc    Get all users for a tenant (with optional role filter)
 * @access  Private (ADMIN only)
 */
router.get('/', authenticate, authorize('ADMIN'), userController.getAll.bind(userController));

/**
 * @route   POST /api/:tenant/users
 * @desc    Create a new staff user (Doctor or Pharmacist)
 * @access  Private (ADMIN only)
 */
router.post('/', authenticate, authorize('ADMIN'), userController.createStaff.bind(userController));

export default router;
