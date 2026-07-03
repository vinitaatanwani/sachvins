-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "daysPerWeek" INTEGER,
ADD COLUMN     "hasSeenAppTour" BOOLEAN NOT NULL DEFAULT false;
