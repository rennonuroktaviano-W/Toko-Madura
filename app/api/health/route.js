import { prisma } from "@/lib/db";
import { databaseTerpasang } from "@/lib/adapter";
import { PESAN_AUTH_SECRET } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  const url = databaseTerpasang();
  const authSecret = process.env.AUTH_SECRET;
  const laporan = {
    ok: false,
    database_terpasang: Boolean(url),
    auth_secret_aman:
      Boolean(authSecret) && authSecret !== "warung-madura-dev-secret-change-me",
    ssl_aktif:
      Boolean(url) &&
      ((process.env.DATABASE_SSL ?? "").toLowerCase() === "true" ||
        ((process.env.DATABASE_SSL ?? "").toLowerCase() !== "false" &&
          !["localhost", "127.0.0.1", "::1"].includes(url.hostname))),
    db_menjawab: false,
    latensi_ms: null,
    error: null,
  };

  if (!Boolean(url)) laporan.error = "DATABASE_URL kosong atau tidak bisa di-parse.";
  if (!Boolean(laporan.auth_secret_aman)) laporan.error = PESAN_AUTH_SECRET;

  const mulai = Date.now();
  try {
    await prisma.user.count();
    laporan.db_menjawab = true;
    laporan.ok = true;
    laporan.error = null;
  } catch (err) {
    laporan.error = String(err?.message ?? err).slice(0, 300);
  }
  laporan.latensi_ms = Date.now() - mulai;

  return Response.json(laporan, {
    status: laporan.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
