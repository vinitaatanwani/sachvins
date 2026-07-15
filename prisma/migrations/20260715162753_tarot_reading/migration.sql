-- CreateEnum
CREATE TYPE "TarotStatus" AS ENUM ('pending_payment', 'paid', 'completed', 'canceled');

-- CreateTable
CREATE TABLE "TarotReading" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "priceInr" INTEGER NOT NULL,
    "status" "TarotStatus" NOT NULL DEFAULT 'pending_payment',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TarotReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TarotReading_profileId_createdAt_idx" ON "TarotReading"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "TarotReading" ADD CONSTRAINT "TarotReading_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
