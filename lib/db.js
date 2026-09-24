import { PrismaClient } from "../generated/prisma/client";
import { createAdapter } from "./adapter";

const globalForPrisma = globalThis;

function createClient() {
  return new PrismaClient({ adapter: createAdapter() });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;