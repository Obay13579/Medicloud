/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `genericName` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `minStock` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `attachments` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `vitalSigns` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `mrNumber` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `dispensedAt` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `dispensedBy` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `medicalRecordId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `dob` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gender` on the `Patient` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `recordId` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Prescription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicalRecordId_fkey";

-- DropIndex
DROP INDEX "Appointment_tenantId_doctorId_date_idx";

-- DropIndex
DROP INDEX "Appointment_tenantId_patientId_idx";

-- DropIndex
DROP INDEX "Drug_tenantId_name_idx";

-- DropIndex
DROP INDEX "Drug_tenantId_stock_idx";

-- DropIndex
DROP INDEX "MedicalRecord_tenantId_visitDate_idx";

-- DropIndex
DROP INDEX "Patient_tenantId_mrNumber_key";

-- DropIndex
DROP INDEX "Patient_tenantId_name_idx";

-- DropIndex
DROP INDEX "Patient_tenantId_phone_idx";

-- DropIndex
DROP INDEX "Prescription_tenantId_createdAt_idx";

-- DropIndex
DROP INDEX "User_tenantId_role_idx";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "createdAt",
DROP COLUMN "notes",
DROP COLUMN "updatedAt",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Drug" DROP COLUMN "category",
DROP COLUMN "createdAt",
DROP COLUMN "expiryDate",
DROP COLUMN "genericName",
DROP COLUMN "minStock",
DROP COLUMN "price",
DROP COLUMN "supplier",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "attachments",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "vitalSigns";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "address",
DROP COLUMN "allergies",
DROP COLUMN "bloodType",
DROP COLUMN "createdAt",
DROP COLUMN "dateOfBirth",
DROP COLUMN "email",
DROP COLUMN "emergencyContact",
DROP COLUMN "mrNumber",
DROP COLUMN "updatedAt",
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "dispensedAt",
DROP COLUMN "dispensedBy",
DROP COLUMN "doctorId",
DROP COLUMN "medicalRecordId",
DROP COLUMN "notes",
DROP COLUMN "patientId",
DROP COLUMN "updatedAt",
ADD COLUMN     "recordId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "isActive",
DROP COLUMN "logoUrl",
DROP COLUMN "phone",
DROP COLUMN "settings",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- DropTable
DROP TABLE "Invoice";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- DropEnum
DROP TYPE "PrescriptionStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "Appointment_tenantId_doctorId_idx" ON "Appointment"("tenantId", "doctorId");

-- CreateIndex
CREATE INDEX "Drug_tenantId_idx" ON "Drug"("tenantId");

-- CreateIndex
CREATE INDEX "Patient_tenantId_idx" ON "Patient"("tenantId");

-- CreateIndex
CREATE INDEX "Prescription_tenantId_status_idx" ON "Prescription"("tenantId", "status");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
