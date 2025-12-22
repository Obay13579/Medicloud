import { Router } from 'express';
import { getTenants, registerTenant } from '../controllers/tenantController';

const router = Router();

router.get('/', getTenants);      // View all
router.post('/', registerTenant); // Create new

export default router;