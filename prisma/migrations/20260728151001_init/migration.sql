/*
  Warnings:

  - Made the column `attendanceCode` on table `event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "event" ALTER COLUMN "attendanceCode" SET NOT NULL;
