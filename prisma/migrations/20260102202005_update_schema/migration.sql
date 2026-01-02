-- AlterTable
ALTER TABLE "neon_auth"."account" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "neon_auth"."invitation" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "neon_auth"."jwks" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "neon_auth"."member" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "neon_auth"."organization" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "neon_auth"."project_config" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "neon_auth"."session" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "neon_auth"."user" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "neon_auth"."verification" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
