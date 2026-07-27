/*
  Warnings:

  - You are about to drop the column `compensation` on the `career_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `career_reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "career_reviews" DROP COLUMN "compensation",
DROP COLUMN "industry";
