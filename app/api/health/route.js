import { prisma } from "@/lib/db";
import { databaseTerpasang, sslAktif } from "@/lib/adapter";
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
    ssl_aktif: sslAktif(url),
    db_menjawab: false,
    latensi_ms: null,
    error: null,
    masalah: [],
  };

  if (!laporan.database_terpasang) {
    laporan.masalah.push("DATABASE_URL kosong atau tidak bisa di-parse.");
  }
  if (!laporan.auth_secret_aman) {
    laporan.masalah.push(PESAN_AUTH_SECRET);
  }

  const mulai = Date.now();
  try {
    await prisma.user.count();
    laporan.db_menjawab = true;
  } catch (err) {
    laporan.masalah.push(
      err?.code
        ? `Koneksi database gagal (${err.code}).`
        : "Koneksi database gagal."
    );
  }
  laporan.latensi_ms = Date.now() - mulai;

  laporan.ok = laporan.masalah.length === 0;
  laporan.error = laporan.masalah.length > 0 ? laporan.masalah.join(" ") : null;

  return Response.json(laporan, {
    status: laporan.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
