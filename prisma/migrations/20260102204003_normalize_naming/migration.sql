/*
  Warnings:

  - You are about to drop the column `allow_localhost` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `email_and_password` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `email_provider` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint_id` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `social_providers` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `trusted_origins` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `project_config` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `events_attended` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `last_modified` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `resume_url` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `applications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[endpointId]` on the table `project_config` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `allowLocalhost` to the `project_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endpointId` to the `project_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialProviders` to the `project_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trustedOrigins` to the `project_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `project_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "userCheck";

-- DropIndex
DROP INDEX "neon_auth"."project_config_endpoint_id_key";

-- DropIndex
DROP INDEX "applications_userID_key";

-- AlterTable
ALTER TABLE "neon_auth"."project_config" DROP COLUMN "allow_localhost",
DROP COLUMN "created_at",
DROP COLUMN "email_and_password",
DROP COLUMN "email_provider",
DROP COLUMN "endpoint_id",
DROP COLUMN "social_providers",
DROP COLUMN "trusted_origins",
DROP COLUMN "updated_at",
ADD COLUMN     "allowLocalhost" BOOLEAN NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailAndPassword" JSONB,
ADD COLUMN     "emailProvider" JSONB,
ADD COLUMN     "endpointId" TEXT NOT NULL,
ADD COLUMN     "socialProviders" JSONB NOT NULL,
ADD COLUMN     "trustedOrigins" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "created_at",
DROP COLUMN "events_attended",
DROP COLUMN "full_name",
DROP COLUMN "last_modified",
DROP COLUMN "resume_url",
DROP COLUMN "userID",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventsAttended" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "lastModified" TIMESTAMPTZ(6),
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "userId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "project_config_endpointId_key" ON "neon_auth"."project_config"("endpointId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_key" ON "applications"("userId");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "userCheck" FOREIGN KEY ("userId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
