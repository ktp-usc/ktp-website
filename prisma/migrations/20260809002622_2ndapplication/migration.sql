-- DropIndex
DROP INDEX "applications_userId_key";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "semeseter" TEXT NOT NULL DEFAULT 'SPRING 2026';

-- CreateTable
CREATE TABLE "currentSemester" (
    "semester" TEXT NOT NULL,

    CONSTRAINT "currentSemester_pkey" PRIMARY KEY ("semester")
);
