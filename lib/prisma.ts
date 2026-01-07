import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { createRequire } from "module";

process.env.WS_NO_BUFFERUTIL = "1";
process.env.WS_NO_UTF_8_VALIDATE = "1";

const require = createRequire(import.meta.url);
const { neonConfig } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
const ws = require("ws") as typeof import("ws");

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
}

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
