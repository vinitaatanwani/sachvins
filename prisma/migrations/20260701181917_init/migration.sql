-- CreateEnum
CREATE TYPE "FocusArea" AS ENUM ('focus_attention', 'self_worth', 'relationships', 'career_purpose', 'emotional_world', 'spirituality');

-- CreateEnum
CREATE TYPE "NervousSystemState" AS ENUM ('regulated', 'fight_flight', 'freeze_fawn');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('monthly', 'quarterly', 'yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled');

-- CreateEnum
CREATE TYPE "CoachingPackageType" AS ENUM ('seven_session', 'eleven_session');

-- CreateEnum
CREATE TYPE "CoachingPackageStatus" AS ENUM ('pending_payment', 'active', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "ClarityBookingStatus" AS ENUM ('scheduled', 'completed', 'no_show', 'canceled');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "convertedToProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "profileId" TEXT,
    "domainScores" JSONB NOT NULL,
    "primaryFocusArea" "FocusArea" NOT NULL,
    "secondaryFocusArea" "FocusArea",
    "nervousSystemState" "NervousSystemState" NOT NULL,
    "emotionalPortrait" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "focusArea" "FocusArea",
    "nervousSystemState" "NervousSystemState",
    "notificationTimeAm" TEXT,
    "notificationTimePm" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "focusArea" "FocusArea" NOT NULL,
    "prompt" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "responses" JSONB NOT NULL,
    "focusScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaritySession" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "calendlyEventUri" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "status" "ClarityBookingStatus" NOT NULL DEFAULT 'scheduled',
    "coachNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaritySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingPackage" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "packageType" "CoachingPackageType" NOT NULL,
    "priceInr" INTEGER NOT NULL,
    "sessionsTotal" INTEGER NOT NULL,
    "sessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "status" "CoachingPackageStatus" NOT NULL DEFAULT 'pending_payment',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachSessionNote" (
    "id" TEXT NOT NULL,
    "coachingPackageId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachSessionNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_leadId_key" ON "QuizResult"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "JournalEntry_profileId_date_idx" ON "JournalEntry"("profileId", "date");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_profileId_weekOf_idx" ON "WeeklyCheckIn"("profileId", "weekOf");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_profileId_key" ON "Subscription"("profileId");

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaritySession" ADD CONSTRAINT "ClaritySession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingPackage" ADD CONSTRAINT "CoachingPackage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSessionNote" ADD CONSTRAINT "CoachSessionNote_coachingPackageId_fkey" FOREIGN KEY ("coachingPackageId") REFERENCES "CoachingPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
