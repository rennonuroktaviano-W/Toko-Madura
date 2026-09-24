import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export function createAdapter() {
  const raw = process.env.DATABASE_URL ?? "";
  if (!raw) {
    return new PrismaMariaDb({
      host: "localhost",
      port: 3306,
      user: "",
      password: "",
      database: "",
      connectionLimit: 1,
      connectTimeout: 30000,
      acquireTimeout: 30000,
      charset: "utf8mb4",
      timezone: "+07:00",
    });
  }
  const url = new URL(raw);
  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 1,
    connectTimeout: 30000,
    acquireTimeout: 30000,
    charset: "utf8mb4",
    timezone: "+07:00",
  });
}