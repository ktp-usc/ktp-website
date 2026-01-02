-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "neon_auth";

-- CreateEnum
CREATE TYPE "applicationStatus" AS ENUM ('CLOSED', 'UNDER_REVIEW', 'INTERVIEW', 'WAITLIST', 'BID_OFFERED', 'BID_DECLINED', 'BID_ACCEPTED');

-- CreateEnum
CREATE TYPE "leaderType" AS ENUM ('N/A', 'PRESIDENT', 'VICE_PRESIDENT', 'VP_FINANCE', 'VP_PROFDEV', 'VP_ENGAGEMENT', 'VP_OUTREACH', 'VP_MARKETING', 'VP_TECHDEV', 'SECRETARY', 'CHAIR_INFRASTRUCTURE', 'CHAIR_CONFERENCES');

-- CreateEnum
CREATE TYPE "type" AS ENUM ('APPLICANT', 'PNM', 'BROTHER', 'LEADERSHIP', 'ALUMNI');

-- CreateEnum
CREATE TYPE "gradSemester" AS ENUM ('SPRING', 'FALL');

-- CreateTable
CREATE TABLE "neon_auth"."account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(6),
    "refreshTokenExpiresAt" TIMESTAMPTZ(6),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."invitation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterId" UUID NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."jwks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."project_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trusted_origins" JSONB NOT NULL,
    "social_providers" JSONB NOT NULL,
    "email_provider" JSONB,
    "email_and_password" JSONB,
    "allow_localhost" BOOLEAN NOT NULL,

    CONSTRAINT "project_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMPTZ(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neon_auth"."verification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "firstName" TEXT NOT NULL DEFAULT 'john',
    "lastName" TEXT NOT NULL DEFAULT 'smith',
    "majors" TEXT[],
    "minors" TEXT[],
    "type" "type",
    "schoolEmail" TEXT,
    "personalEmail" TEXT,
    "gradSemester" "gradSemester",
    "headshotBlobURL" TEXT,
    "resumeBlobURL" TEXT,
    "id" UUID NOT NULL,
    "leaderType" "leaderType" DEFAULT 'N/A',
    "phoneNum" TEXT,
    "isNew" BOOLEAN,
    "gradYear" INTEGER,
    "pledgeClass" TEXT DEFAULT 'n/a',
    "hometown" TEXT,
    "linkedin" TEXT,
    "github" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" BIGSERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "classification" TEXT,
    "major" TEXT,
    "minor" TEXT,
    "resume_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "events_attended" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "isFlagged" BOOLEAN,
    "last_modified" TIMESTAMPTZ(6),
    "userID" UUID NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "neon_auth"."account"("userId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "neon_auth"."invitation"("email");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "neon_auth"."invitation"("organizationId");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "neon_auth"."member"("organizationId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "neon_auth"."member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "neon_auth"."organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_config_endpoint_id_key" ON "neon_auth"."project_config"("endpoint_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "neon_auth"."session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "neon_auth"."session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "neon_auth"."user"("email");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "neon_auth"."verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_headshotBlobURL_key" ON "accounts"("headshotBlobURL");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_resumeBlobURL_key" ON "accounts"("resumeBlobURL");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userID_key" ON "applications"("userID");

-- AddForeignKey
ALTER TABLE "neon_auth"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neon_auth"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neon_auth"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "neon_auth"."organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neon_auth"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "neon_auth"."organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neon_auth"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neon_auth"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "authCheck" FOREIGN KEY ("id") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "userCheck" FOREIGN KEY ("userID") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
