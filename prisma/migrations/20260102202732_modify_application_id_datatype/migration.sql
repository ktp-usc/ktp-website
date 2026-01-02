/*
  Warnings:

  - The primary key for the `applications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "applications" DROP CONSTRAINT "applications_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");
