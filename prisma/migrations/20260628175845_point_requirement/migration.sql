/*
  Warnings:

  - Added the required column `maxPoints` to the `point_requirements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "point_requirements" ADD COLUMN     "maxPoints" INTEGER NOT NULL;
