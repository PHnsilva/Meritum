-- CreateEnum
CREATE TYPE "partner_status" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable: add status column defaulting to APPROVED so existing rows stay active
ALTER TABLE "partner_companies" ADD COLUMN "status" "partner_status" NOT NULL DEFAULT 'APPROVED';
