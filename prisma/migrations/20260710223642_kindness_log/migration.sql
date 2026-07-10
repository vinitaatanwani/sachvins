-- CreateTable
CREATE TABLE "KindnessLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KindnessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KindnessLog_profileId_date_idx" ON "KindnessLog"("profileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "KindnessLog_profileId_date_key" ON "KindnessLog"("profileId", "date");

-- AddForeignKey
ALTER TABLE "KindnessLog" ADD CONSTRAINT "KindnessLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
