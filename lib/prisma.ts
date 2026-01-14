import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import WebSocket from 'ws'

process.env.WS_NO_BUFFERUTIL = '1'
process.env.WS_NO_UTF_8_VALIDATE = '1'

// neon expects a WebSocket constructor
neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as {
    prisma?: PrismaClient
}

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
