-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('OWNER', 'MANAGER', 'FRANCHISEE', 'EMPLOYEE', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('DELIVERY', 'PICKUP', 'SERVICE', 'MEETING', 'TASK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "regionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL DEFAULT 'BC',
    "postalCode" TEXT NOT NULL,
    "notes" TEXT,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastContactDate" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" INTEGER NOT NULL,
    "regionId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "lineItems" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "gstAmount" DECIMAL(10,2) NOT NULL,
    "pstAmount" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT,
    "emailedAt" TIMESTAMP(3),
    "emailedTo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."AppointmentType" NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "customerId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settings" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "regionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_regionId_idx" ON "public"."User"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "public"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "public"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Customer_regionId_idx" ON "public"."Customer"("regionId");

-- CreateIndex
CREATE INDEX "Customer_businessName_idx" ON "public"."Customer"("businessName");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "public"."Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "public"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_regionId_idx" ON "public"."Invoice"("regionId");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "public"."Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "public"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "Appointment_regionId_idx" ON "public"."Appointment"("regionId");

-- CreateIndex
CREATE INDEX "Appointment_startDate_idx" ON "public"."Appointment"("startDate");

-- CreateIndex
CREATE INDEX "Appointment_customerId_idx" ON "public"."Appointment"("customerId");

-- CreateIndex
CREATE INDEX "Settings_regionId_idx" ON "public"."Settings"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_category_key_regionId_key" ON "public"."Settings"("category", "key", "regionId");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
