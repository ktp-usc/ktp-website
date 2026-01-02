import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// required for Neon in Node environments
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
}

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
