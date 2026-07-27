-- CreateTable
CREATE TABLE "point_requirements" (
    "id" UUID NOT NULL,
    "memberType" "type" NOT NULL,
    "semester" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredAmount" INTEGER NOT NULL,
    "pointsPerCompletion" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,

    CONSTRAINT "point_requirements_pkey" PRIMARY KEY ("id")
);
