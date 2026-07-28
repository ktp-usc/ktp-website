-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."applicationStatus" AS ENUM ('CLOSED', 'UNDER_REVIEW', 'INTERVIEW', 'WAITLIST', 'BID_OFFERED', 'BID_DECLINED', 'BID_ACCEPTED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "public"."gradSemester" AS ENUM ('SPRING', 'FALL');

-- CreateEnum
CREATE TYPE "public"."leaderType" AS ENUM ('N/A', 'PRESIDENT', 'VICE_PRESIDENT', 'VP_FINANCE', 'VP_PROFDEV', 'VP_ENGAGEMENT', 'VP_OUTREACH', 'VP_MARKETING', 'VP_TECHDEV', 'SECRETARY', 'CHAIR_INFRASTRUCTURE', 'CHAIR_CONFERENCES');

-- CreateEnum
CREATE TYPE "public"."memberType" AS ENUM ('ACTIVE', 'PLEDGE', 'APPLICANT', 'ALL_MEMBERS');

-- CreateEnum
CREATE TYPE "public"."type" AS ENUM ('APPLICANT', 'PNM', 'BROTHER', 'LEADERSHIP', 'ALUMNI');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT 'john',
    "lastName" TEXT NOT NULL DEFAULT 'smith',
    "majors" TEXT[],
    "minors" TEXT[],
    "type" "public"."type",
    "schoolEmail" TEXT,
    "personalEmail" TEXT,
    "gradSemester" "public"."gradSemester",
    "headshotBlobURL" TEXT,
    "resumeBlobURL" TEXT,
    "leaderType" "public"."leaderType" DEFAULT 'N/A',
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
CREATE TABLE "public"."applications" (
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
    "status" "public"."applicationStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "circumstance" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."career_reviews" (
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
CREATE TABLE "public"."comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusOverride" "public"."applicationStatus",
    "commenter" TEXT,
    "body" TEXT,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event" (
    "id" UUID NOT NULL,
    "attendance" TEXT[],
    "PointRequirement" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "activesOnly" BOOLEAN NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."point_requirements" (
    "id" UUID NOT NULL,
    "semester" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredAmount" INTEGER NOT NULL,
    "pointsPerCompletion" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "memberType" "public"."memberType" NOT NULL,

    CONSTRAINT "point_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vote_eligibility" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "votedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_eligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vote_options" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vote_questions" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMPTZ(6),
    "createdById" UUID NOT NULL,

    CONSTRAINT "vote_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vote_votes" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "optionId" UUID NOT NULL,
    "voterHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_github_key" ON "public"."accounts"("github" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_headshotBlobURL_key" ON "public"."accounts"("headshotBlobURL" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_linkedin_key" ON "public"."accounts"("linkedin" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_resumeBlobURL_key" ON "public"."accounts"("resumeBlobURL" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_key" ON "public"."applications"("userId" ASC);

-- CreateIndex
CREATE INDEX "career_reviews_company_idx" ON "public"."career_reviews"("company" ASC);

-- CreateIndex
CREATE INDEX "career_reviews_createdAt_idx" ON "public"."career_reviews"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "comment_applicationId_idx" ON "public"."comment"("applicationId" ASC);

-- CreateIndex
CREATE INDEX "vote_eligibility_accountId_idx" ON "public"."vote_eligibility"("accountId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "vote_eligibility_questionId_accountId_key" ON "public"."vote_eligibility"("questionId" ASC, "accountId" ASC);

-- CreateIndex
CREATE INDEX "vote_eligibility_questionId_idx" ON "public"."vote_eligibility"("questionId" ASC);

-- CreateIndex
CREATE INDEX "vote_options_questionId_idx" ON "public"."vote_options"("questionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "vote_options_questionId_label_key" ON "public"."vote_options"("questionId" ASC, "label" ASC);

-- CreateIndex
CREATE INDEX "vote_questions_isActive_idx" ON "public"."vote_questions"("isActive" ASC);

-- CreateIndex
CREATE INDEX "vote_votes_optionId_idx" ON "public"."vote_votes"("optionId" ASC);

-- CreateIndex
CREATE INDEX "vote_votes_questionId_idx" ON "public"."vote_votes"("questionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "vote_votes_questionId_voterHash_key" ON "public"."vote_votes"("questionId" ASC, "voterHash" ASC);

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "userCheck" FOREIGN KEY ("userId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."career_reviews" ADD CONSTRAINT "career_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vote_eligibility" ADD CONSTRAINT "vote_eligibility_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vote_eligibility" ADD CONSTRAINT "vote_eligibility_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vote_options" ADD CONSTRAINT "vote_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vote_questions" ADD CONSTRAINT "vote_questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vote_votes" ADD CONSTRAINT "vote_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."vote_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vote_votes" ADD CONSTRAINT "vote_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

