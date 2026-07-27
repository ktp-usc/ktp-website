-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL,
    "attendance" TEXT[],
    "DateTime" TIMESTAMP(3) NOT NULL,
    "PointRequirement" TEXT NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);
