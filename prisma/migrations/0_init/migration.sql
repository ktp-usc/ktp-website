-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "applicationStatus" AS ENUM ('CLOSED', 'UNDER_REVIEW', 'INTERVIEW', 'WAITLIST', 'BID_OFFERED', 'BID_DECLINED', 'BID_ACCEPTED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "leaderType" AS ENUM ('N/A', 'PRESIDENT', 'VICE_PRESIDENT', 'VP_FINANCE', 'VP_PROFDEV', 'VP_ENGAGEMENT', 'VP_OUTREACH', 'VP_MARKETING', 'VP_TECHDEV', 'SECRETARY', 'CHAIR_INFRASTRUCTURE', 'CHAIR_CONFERENCES');

-- CreateEnum
CREATE TYPE "memberType" AS ENUM ('ACTIVE', 'PLEDGE', 'APPLICANT', 'ALL_MEMBERS');

-- CreateEnum
CREATE TYPE "type" AS ENUM ('APPLICANT', 'PNM', 'BROTHER', 'LEADERSHIP', 'ALUMNI');

-- CreateEnum
CREATE TYPE "gradSemester" AS ENUM ('SPRING', 'FALL');

-- CreateTable
CREATE TABLE "point_requirements" (
    "id" UUID NOT NULL,
    "semester" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredAmount" INTEGER NOT NULL,
    "pointsPerCompletion" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "memberType" "memberType" NOT NULL,

    CONSTRAINT "point_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL,
    "attendance" TEXT[],
    "PointRequirement" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "activesOnly" BOOLEAN NOT NULL,
    "attendanceCode" TEXT NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

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
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "lastModified" TIMESTAMPTZ(6) NOT NULL,
    "submittedAt" TIMESTAMPTZ(6),
    "userId" UUID NOT NULL,
    "gpa" DOUBLE PRECISION,
    "status" "applicationStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "circumstance" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusOverride" "applicationStatus",
    "commenter" TEXT,
    "body" TEXT,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_questions" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMPTZ(6),
    "createdById" UUID NOT NULL,

    CONSTRAINT "vote_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_options" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_votes" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "optionId" UUID NOT NULL,
    "voterHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_eligibility" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "votedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_eligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID,
    "company" TEXT,
    "role" TEXT,
    "location" TEXT,
    "appTimeline" TEXT,
    "interviewQs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technicalDetails" TEXT,
    "canRefer" BOOLEAN DEFAULT false,
    "pros" TEXT,
    "cons" TEXT,
    "advice" TEXT,
    "authorName" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_attendanceCode_key" ON "event"("attendanceCode");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_headshotBlobURL_key" ON "accounts"("headshotBlobURL");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_resumeBlobURL_key" ON "accounts"("resumeBlobURL");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_linkedin_key" ON "accounts"("linkedin");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_github_key" ON "accounts"("github");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_key" ON "applications"("userId");

-- CreateIndex
CREATE INDEX "comment_applicationId_idx" ON "comment"("applicationId");

-- CreateIndex
CREATE INDEX "vote_questions_isActive_idx" ON "vote_questions"("isActive");

-- CreateIndex
CREATE INDEX "vote_options_questionId_idx" ON "vote_options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_options_questionId_label_key" ON "vote_options"("questionId", "label");

-- CreateIndex
CREATE INDEX "vote_votes_questionId_idx" ON "vote_votes"("questionId");

-- CreateIndex
CREATE INDEX "vote_votes_optionId_idx" ON "vote_votes"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_votes_questionId_voterHash_key" ON "vote_votes"("questionId", "voterHash");

-- CreateIndex
CREATE INDEX "vote_eligibility_questionId_idx" ON "vote_eligibility"("questionId");

-- CreateIndex
CREATE INDEX "vote_eligibility_accountId_idx" ON "vote_eligibility"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_eligibility_questionId_accountId_key" ON "vote_eligibility"("questionId", "accountId");

-- CreateIndex
CREATE INDEX "career_reviews_company_idx" ON "career_reviews"("company");

-- CreateIndex
CREATE INDEX "career_reviews_createdAt_idx" ON "career_reviews"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "employers_email_key" ON "employers"("email");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "userCheck" FOREIGN KEY ("userId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_questions" ADD CONSTRAINT "vote_questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_options" ADD CONSTRAINT "vote_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_votes" ADD CONSTRAINT "vote_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "vote_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_votes" ADD CONSTRAINT "vote_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_eligibility" ADD CONSTRAINT "vote_eligibility_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_eligibility" ADD CONSTRAINT "vote_eligibility_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_reviews" ADD CONSTRAINT "career_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

