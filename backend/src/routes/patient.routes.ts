import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { recordController } from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateTenant } from '../middlewares/tenant.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication and tenant validation
router.use(authenticate);
router.use(validateTenant);

/**
 * @route   GET /api/:tenant/patients
 * @desc    List all patients
 * @access  Private
 */
router.get('/', patientController.getAll.bind(patientController));

/**
 * @route   POST /api/:tenant/patients
 * @desc    Register new patient
 * @access  Private
 */
router.post('/', patientController.create.bind(patientController));

/**
 * @route   GET /api/:tenant/patients/:id
 * @desc    Get patient detail
 * @access  Private
 */
router.get('/:id', patientController.getById.bind(patientController));

/**
 * @route   PATCH /api/:tenant/patients/:id
 * @desc    Update patient info
 * @access  Private
 */
router.patch('/:id', patientController.update.bind(patientController));

/**
 * @route   DELETE /api/:tenant/patients/:id
 * @desc    Delete patient
 * @access  Private
 */
router.delete('/:id', patientController.delete.bind(patientController));

/**
 * @route   GET /api/:tenant/patients/:id/records
 * @desc    Get patient's medical history
 * @access  Private
 */
router.get('/:id/records', recordController.getByPatient.bind(recordController));

export default router;
