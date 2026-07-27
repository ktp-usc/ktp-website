/*
  Warnings:

  - You are about to drop the column `DateTime` on the `event` table. All the data in the column will be lost.
  - Added the required column `description` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "DateTime",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
