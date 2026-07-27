/*
  Warnings:

  - The values [BOTH] on the enum `RequirmentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `point_requirements` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `point_requirements` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequirmentType_new" AS ENUM ('RUSHEE', 'APPLICANT', 'BROTHER', 'MEMBER');
ALTER TABLE "point_requirements" ALTER COLUMN "memberType" TYPE "RequirmentType_new" USING ("memberType"::text::"RequirmentType_new");
ALTER TYPE "RequirmentType" RENAME TO "RequirmentType_old";
ALTER TYPE "RequirmentType_new" RENAME TO "RequirmentType";
DROP TYPE "public"."RequirmentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "point_requirements" DROP COLUMN "category",
DROP COLUMN "deadline";
