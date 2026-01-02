/*
  Warnings:

  - You are about to drop the column `userId` on the `accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "authCheck";

-- DropIndex
DROP INDEX "accounts_userId_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "authCheck" FOREIGN KEY ("id") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
