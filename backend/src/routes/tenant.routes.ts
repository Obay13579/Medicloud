import { Router } from 'express';
import { tenantController } from '../controllers/tenant.controller';

const router = Router();

/**
 * @route   POST /api/tenants
 * @desc    Create a new clinic
 * @access  Public
 */
router.post('/', tenantController.create.bind(tenantController));

/**
 * @route   GET /api/tenants/:slug
 * @desc    Get clinic by slug
 * @access  Public
 */
router.get('/:slug', tenantController.getBySlug.bind(tenantController));

export default router;
