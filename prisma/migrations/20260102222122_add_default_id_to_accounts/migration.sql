-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "authCheck";

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "authCheck" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
