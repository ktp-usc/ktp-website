/*
  Warnings:

  - You are about to drop the column `github` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "github",
DROP COLUMN "linkedin";
