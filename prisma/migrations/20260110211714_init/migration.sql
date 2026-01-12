-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "StatusOverride" "applicationStatus",
    "Commenter" TEXT,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_id_fkey" FOREIGN KEY ("id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
