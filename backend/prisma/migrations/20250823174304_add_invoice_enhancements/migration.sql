/*
  Warnings:

  - The `paymentMethod` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CHEQUE', 'E_TRANSFER', 'CREDIT_CARD', 'DEBIT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('RESURFACING', 'NEW_BOARD', 'STAINLESS_INSERT', 'STAINLESS_CLAMPS', 'BOARD_MODIFICATIONS', 'SPECIAL');

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "public"."PaymentMethod";

-- AlterTable
ALTER TABLE "public"."Settings" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."InvoiceSequence" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "lastInvoiceNumber" INTEGER NOT NULL DEFAULT 10000,
    "prefix" TEXT,
    "suffix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_regionId_key" ON "public"."InvoiceSequence"("regionId");

-- CreateIndex
CREATE INDEX "InvoiceSequence_regionId_idx" ON "public"."InvoiceSequence"("regionId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "public"."Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "public"."Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "Settings_category_idx" ON "public"."Settings"("category");
