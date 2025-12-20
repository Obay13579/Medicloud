import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create a test prisma client
export const prisma = new PrismaClient();

// Test data storage for cleanup and reuse across tests
export const testData = {
    tenantId: '',
    userId: '',
    doctorId: '',
    pharmacistId: '',
    patientId: '',
    appointmentId: '',
    recordId: '',
    prescriptionId: '',
    drugId: '',
    token: '',
    doctorToken: '',
    pharmacistToken: '',
    tenantSlug: 'test-clinic-' + Date.now(),
};

// Hash password for test users
const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Generate JWT token
const generateToken = (user: { id: string; tenantId: string; email: string; name: string; role: string }) => {
    const secret = process.env.JWT_SECRET || 'dev_secret_key_jangan_dipakai_prod';
    return jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        secret,
        { expiresIn: '24h' }
    );
};

// Setup before all tests
beforeAll(async () => {
    try {
        // Create test tenant
        const tenant = await prisma.tenant.create({
            data: {
                name: 'Test Clinic',
                slug: testData.tenantSlug,
            },
        });
        testData.tenantId = tenant.id;

        // Create admin user
        const hashedPassword = await hashPassword('password123');
        const adminUser = await prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: 'admin@test-clinic.com',
                password: hashedPassword,
                name: 'Admin Test',
                role: 'ADMIN',
            },
        });
        testData.userId = adminUser.id;
        testData.token = generateToken(adminUser);

        // Create doctor user
        const doctorUser = await prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: 'doctor@test-clinic.com',
                password: hashedPassword,
                name: 'Dr. Test',
                role: 'DOCTOR',
            },
        });
        testData.doctorId = doctorUser.id;
        testData.doctorToken = generateToken(doctorUser);

        // Create pharmacist user
        const pharmacistUser = await prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: 'pharmacist@test-clinic.com',
                password: hashedPassword,
                name: 'Pharmacist Test',
                role: 'PHARMACIST',
            },
        });
        testData.pharmacistId = pharmacistUser.id;
        testData.pharmacistToken = generateToken(pharmacistUser);

        // Create test patient
        const patient = await prisma.patient.create({
            data: {
                tenantId: tenant.id,
                name: 'Test Patient',
                phone: '08123456789',
                dob: new Date('1990-01-15'),
                gender: 'MALE',
            },
        });
        testData.patientId = patient.id;

        // Create test medical record
        const record = await prisma.medicalRecord.create({
            data: {
                tenantId: tenant.id,
                patientId: patient.id,
                doctorId: doctorUser.id,
                subjective: 'Test complaint',
                objective: 'Test findings',
                assessment: 'Test diagnosis',
                plan: 'Test treatment plan',
            },
        });
        testData.recordId = record.id;

        console.log('Test setup completed successfully');
    } catch (error) {
        console.error('Test setup failed:', error);
        throw error;
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        // Delete all test data in correct order (respect foreign keys)
        await prisma.prescription.deleteMany({ where: { tenantId: testData.tenantId } });
        await prisma.medicalRecord.deleteMany({ where: { tenantId: testData.tenantId } });
        await prisma.appointment.deleteMany({ where: { tenantId: testData.tenantId } });
        await prisma.drug.deleteMany({ where: { tenantId: testData.tenantId } });
        await prisma.patient.deleteMany({ where: { tenantId: testData.tenantId } });
        await prisma.user.deleteMany({ where: { tenantId: testData.tenantId } });
        await prisma.tenant.deleteMany({ where: { id: testData.tenantId } });

        console.log('Test cleanup completed');
    } catch (error) {
        console.error('Test cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
});
