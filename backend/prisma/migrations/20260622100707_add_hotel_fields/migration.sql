-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "cancellationPolicy" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';
