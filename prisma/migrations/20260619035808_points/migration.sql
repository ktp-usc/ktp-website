-- CreateEnum
CREATE TYPE "RequirmentType" AS ENUM ('APPLICANT', 'BROTHER', 'BOTH');

-- CreateTable
CREATE TABLE "point_requirements" (
    "id" UUID NOT NULL,
    "memberType" "RequirmentType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiredAmount" INTEGER NOT NULL,
    "pointsPerCompletion" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_requirements_pkey" PRIMARY KEY ("id")
);
