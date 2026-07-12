-- CreateTable
CREATE TABLE "QuietSit" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,
    "arrived" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuietSit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuietSit_profileId_createdAt_idx" ON "QuietSit"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "QuietSit" ADD CONSTRAINT "QuietSit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
