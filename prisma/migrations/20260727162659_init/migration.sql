/*
  Warnings:

  - Added the required column `compensation` to the `career_reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `career_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "career_reviews" ADD COLUMN     "compensation" TEXT NOT NULL,
ADD COLUMN     "industry" TEXT NOT NULL;
