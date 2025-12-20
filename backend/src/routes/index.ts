import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';
import recordRoutes from './record.routes';
import prescriptionRoutes from './prescription.routes';
import inventoryRoutes from './inventory.routes';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);

// Tenant-scoped routes
router.use('/:tenant/patients', patientRoutes);
router.use('/:tenant/appointments', appointmentRoutes);
router.use('/:tenant/records', recordRoutes);
router.use('/:tenant/prescriptions', prescriptionRoutes);
router.use('/:tenant/inventory', inventoryRoutes);

export default router;
