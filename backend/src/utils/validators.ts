import { z } from 'zod';

// ==================== AUTH ====================

export const registerSchema = z.object({
    tenantId: z.string().min(1, 'Tenant ID is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['ADMIN', 'DOCTOR', 'PHARMACIST'], {
        error: 'Role must be ADMIN, DOCTOR, or PHARMACIST',
    }),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    tenantSlug: z.string().min(1, 'Tenant slug is required'),
});

// ==================== TENANT ====================

export const createTenantSchema = z.object({
    name: z.string().min(2, 'Clinic name must be at least 2 characters'),
    slug: z.string()
        .min(3, 'Slug must be at least 3 characters')
        .max(50, 'Slug must be at most 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
});

// ==================== PATIENT ====================

export const createPatientSchema = z.object({
    name: z.string().min(2, 'Patient name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        error: 'Gender must be MALE, FEMALE, or OTHER',
    }),
});

export const updatePatientSchema = z.object({
    name: z.string().min(2, 'Patient name must be at least 2 characters').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        error: 'Gender must be MALE, FEMALE, or OTHER',
    }).optional(),
});

// ==================== APPOINTMENT ====================

export const createAppointmentSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    doctorId: z.string().min(1, 'Doctor ID is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    timeSlot: z.string().min(1, 'Time slot is required'),
});

export const updateAppointmentSchema = z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }).optional(),
    timeSlot: z.string().min(1, 'Time slot is required').optional(),
    status: z.enum(['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'], {
        error: 'Invalid status',
    }).optional(),
});

// ==================== MEDICAL RECORD ====================

export const createRecordSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional(),
});

// ==================== PRESCRIPTION ====================

export const prescriptionItemSchema = z.object({
    drugName: z.string().min(1, 'Drug name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
    recordId: z.string().min(1, 'Medical record ID is required'),
    items: z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required'),
});

export const updatePrescriptionStatusSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED'], {
        error: 'Status must be PENDING, PROCESSING, or COMPLETED',
    }),
});

// ==================== INVENTORY ====================

export const createDrugSchema = z.object({
    name: z.string().min(1, 'Drug name is required'),
    stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
    unit: z.string().min(1, 'Unit is required'),
});

export const updateDrugStockSchema = z.object({
    stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
});

// ==================== TYPES ====================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionStatusInput = z.infer<typeof updatePrescriptionStatusSchema>;
export type CreateDrugInput = z.infer<typeof createDrugSchema>;
export type UpdateDrugStockInput = z.infer<typeof updateDrugStockSchema>;
