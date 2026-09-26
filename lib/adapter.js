import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const KONEKSI = {
  connectionLimit: 5,
  minimumIdle: 1,
  connectTimeout: 3000,
  acquireTimeout: 3000,
  idleTimeout: 10000,
  charset: "utf8mb4",
  timezone: "+07:00",
};

const HOST_LOKAL = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0", "host.docker.internal"]);

export const PESAN_DATABASE_URL =
  "DATABASE_URL belum diset di environment server. Isi di Vercel > Settings > Environment Variables dengan format mysql://USER:PASSWORD@HOST:3306/NAMA_DB";

function buangKutip(raw) {
  const buka = raw[0];
  if (raw.length >= 2 && (buka === '"' || buka === "'") && raw.at(-1) === buka) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

export function databaseUrlAsli() {
  return buangKutip((process.env.DATABASE_URL ?? "").trim());
}

export function databaseTerpasang() {
  const raw = databaseUrlAsli();
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function sslAktif(url) {
  if (!url) return false;
  const sslManual = (process.env.DATABASE_SSL ?? "").toLowerCase();
  return sslManual === "true" || (sslManual !== "false" && !HOST_LOKAL.has(url.hostname));
}

export function createAdapter() {
  const url = databaseTerpasang();
  if (!url) {
    throw new Error(PESAN_DATABASE_URL);
  }

  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ...KONEKSI,
    ssl: sslAktif(url) ? { rejectUnauthorized: false } : undefined,
  });
}
