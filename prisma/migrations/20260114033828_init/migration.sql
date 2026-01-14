-- CreateEnum
CREATE TYPE "applicationStatus" AS ENUM ('CLOSED', 'UNDER_REVIEW', 'INTERVIEW', 'WAITLIST', 'BID_OFFERED', 'BID_DECLINED', 'BID_ACCEPTED');

-- CreateEnum
CREATE TYPE "leaderType" AS ENUM ('N/A', 'PRESIDENT', 'VICE_PRESIDENT', 'VP_FINANCE', 'VP_PROFDEV', 'VP_ENGAGEMENT', 'VP_OUTREACH', 'VP_MARKETING', 'VP_TECHDEV', 'SECRETARY', 'CHAIR_INFRASTRUCTURE', 'CHAIR_CONFERENCES');

-- CreateEnum
CREATE TYPE "type" AS ENUM ('APPLICANT', 'PNM', 'BROTHER', 'LEADERSHIP', 'ALUMNI');

-- CreateEnum
CREATE TYPE "gradSemester" AS ENUM ('SPRING', 'FALL');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
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
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "classification" TEXT,
    "major" TEXT,
    "minor" TEXT,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "eventsAttended" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "isFlagged" BOOLEAN,
    "lastModified" TIMESTAMPTZ(6) NOT NULL,
    "submittedAt" TIMESTAMPTZ(6),
    "userId" UUID NOT NULL,
    "gpa" DOUBLE PRECISION,
    "status" "applicationStatus" NOT NULL DEFAULT 'UNDER_REVIEW',

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusOverride" "applicationStatus",
    "commenter" TEXT,
    "body" TEXT,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_headshotBlobURL_key" ON "accounts"("headshotBlobURL");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_resumeBlobURL_key" ON "accounts"("resumeBlobURL");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_key" ON "applications"("userId");

-- CreateIndex
CREATE INDEX "comment_applicationId_idx" ON "comment"("applicationId");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "userCheck" FOREIGN KEY ("userId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
