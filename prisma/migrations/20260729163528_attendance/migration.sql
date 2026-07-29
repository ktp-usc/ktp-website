/*
  Warnings:

  - You are about to drop the column `attendance` on the `event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "attendance";

-- CreateTable
CREATE TABLE "attendance" (
    "eventId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "pointsAwarded" INTEGER,
    "checkedInAt" TIMESTAMP(3),

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("eventId","accountId")
);

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
