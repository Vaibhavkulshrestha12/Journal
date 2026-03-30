// @ts-ignore - Suppress TS Server local cache desync on generated Prisma Client
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5, 
  idleTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
