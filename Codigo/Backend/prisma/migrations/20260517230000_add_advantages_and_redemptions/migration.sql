-- CreateTable: advantages
CREATE TABLE "advantages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "cost_in_coins" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "partner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advantages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: redemptions
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coin_cost" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,
    "advantage_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redemptions_code_key" ON "redemptions"("code");

-- AddForeignKey
ALTER TABLE "advantages" ADD CONSTRAINT "advantages_partner_id_fkey"
    FOREIGN KEY ("partner_id") REFERENCES "partner_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_advantage_id_fkey"
    FOREIGN KEY ("advantage_id") REFERENCES "advantages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
