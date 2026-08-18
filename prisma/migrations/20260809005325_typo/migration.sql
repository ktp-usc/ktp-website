/*
  Warnings:

  - You are about to drop the column `semeseter` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "semeseter",
ADD COLUMN     "semester" TEXT NOT NULL DEFAULT 'SPRING 2026';
