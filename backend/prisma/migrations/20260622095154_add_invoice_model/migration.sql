-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'VOID', 'CANCELLED');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "guestStayId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "folioSnapshot" JSONB NOT NULL,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_hotelId_status_idx" ON "Invoice"("hotelId", "status");

-- CreateIndex
CREATE INDEX "Invoice_guestStayId_idx" ON "Invoice"("guestStayId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_guestStayId_fkey" FOREIGN KEY ("guestStayId") REFERENCES "GuestStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
