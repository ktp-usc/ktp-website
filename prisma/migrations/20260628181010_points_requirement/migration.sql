/*
  Warnings:

  - The values [Active] on the enum `memberType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "memberType_new" AS ENUM ('PNM', 'PLEDGE', 'ACTIVE', 'ALL_MEMBERS');
ALTER TABLE "point_requirements" ALTER COLUMN "memberType" TYPE "memberType_new" USING ("memberType"::text::"memberType_new");
ALTER TYPE "memberType" RENAME TO "memberType_old";
ALTER TYPE "memberType_new" RENAME TO "memberType";
DROP TYPE "public"."memberType_old";
COMMIT;
