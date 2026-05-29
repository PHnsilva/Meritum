/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `institutions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "institution_status" AS ENUM ('PENDING', 'APPROVED');

-- AlterEnum
ALTER TYPE "role" ADD VALUE 'INSTITUTION';

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "status" "institution_status" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "institutions_user_id_key" ON "institutions"("user_id");

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
