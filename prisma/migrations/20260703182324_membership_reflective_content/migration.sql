-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "membershipActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "membershipSince" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ReflectiveLetter" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "focusArea" "FocusArea",
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReflectiveLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClarityReport" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "scoreDeltas" JSONB NOT NULL,
    "themes" JSONB NOT NULL,
    "quote" TEXT NOT NULL,
    "thenVsNow" TEXT NOT NULL,
    "focusNext" TEXT NOT NULL,
    "suggestSession" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClarityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffirmationSet" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "lines" JSONB NOT NULL,
    "nervousSystemState" "NervousSystemState",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffirmationSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReflectiveLetter_profileId_weekOf_idx" ON "ReflectiveLetter"("profileId", "weekOf");

-- CreateIndex
CREATE INDEX "ClarityReport_profileId_periodEnd_idx" ON "ClarityReport"("profileId", "periodEnd");

-- CreateIndex
CREATE INDEX "AffirmationSet_profileId_weekOf_idx" ON "AffirmationSet"("profileId", "weekOf");

-- AddForeignKey
ALTER TABLE "ReflectiveLetter" ADD CONSTRAINT "ReflectiveLetter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClarityReport" ADD CONSTRAINT "ClarityReport_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffirmationSet" ADD CONSTRAINT "AffirmationSet_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
