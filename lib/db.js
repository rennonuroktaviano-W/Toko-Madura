import { PrismaClient } from "../generated/prisma/client";
import { createAdapter } from "./adapter";

const globalForPrisma = globalThis;

function ambilClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter: createAdapter() });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "then") return undefined;
      const client = ambilClient();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
