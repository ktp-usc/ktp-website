/*
  Warnings:

  - Changed the type of `memberType` on the `point_requirements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "memberType" AS ENUM ('ACTIVE', 'PLEDGE', 'APPLICANT', 'ALL_MEMBERS');

-- AlterTable
ALTER TABLE "point_requirements" DROP COLUMN "memberType",
ADD COLUMN     "memberType" "memberType" NOT NULL;
