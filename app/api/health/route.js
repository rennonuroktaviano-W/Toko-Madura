import { prisma } from "@/lib/db";
import {
  databaseTerpasang,
  databaseUrlAsli,
  sslAktif,
} from "@/lib/adapter";
import { PESAN_AUTH_SECRET, SECRET_DEV } from "@/lib/auth";
import { kodeSkema } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const IP_LOKAL = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

function dariLokal(request) {
  const forwarded = request?.headers?.get("x-forwarded-for");
  if (forwarded) return IP_LOKAL.has(forwarded.split(",")[0].trim());

  const real = request?.headers?.get("x-real-ip");
  if (real) return IP_LOKAL.has(real);

  const host = request?.headers?.get("host") ?? "";
  const namaHost = host.replace(/:\d+$/, "");
  return namaHost === "localhost" || IP_LOKAL.has(namaHost);
}

export async function GET(request) {
  const url = databaseTerpasang();
  const authSecret = process.env.AUTH_SECRET;
  const adminUsername = process.env.ADMIN_USERNAME?.toLowerCase() || "admin";

  const laporan = {
    ok: false,
    database_url_ada: Boolean(databaseUrlAsli()),
    database_terpasang: Boolean(url),
    auth_secret_aman:
      Boolean(authSecret) &&
      authSecret !== SECRET_DEV &&
      authSecret.length >= 32,
    ssl_aktif: sslAktif(url),
    db_menjawab: false,
    tabel_user_ada: false,
    jumlah_user: null,
    admin_ada: false,
    latensi_ms: null,
    error: null,
    masalah: [],
  };

  if (!laporan.database_terpasang) {
    laporan.masalah.push(
      laporan.database_url_ada
        ? "DATABASE_URL terisi tapi tidak bisa di-parse. Buang tanda kutip di sekitar nilainya."
        : "DATABASE_URL kosong atau tidak bisa di-parse."
    );
  }
  if (!laporan.auth_secret_aman) {
    laporan.masalah.push(PESAN_AUTH_SECRET);
  }

  const mulai = Date.now();
  try {
    const jumlah = await prisma.user.count();
    laporan.db_menjawab = true;
    laporan.tabel_user_ada = true;
    laporan.jumlah_user = jumlah;
    laporan.admin_ada =
      jumlah > 0 &&
      (await prisma.user.count({ where: { username: adminUsername } })) > 0;
  } catch (err) {
    if (kodeSkema(err)) {
      laporan.db_menjawab = true;
      laporan.tabel_user_ada = false;
      laporan.masalah.push(
        "Tabel database belum ada. Jalankan: npx prisma migrate deploy"
      );
    } else {
      laporan.masalah.push(
        err?.code
          ? `Koneksi database gagal (${err.code}).`
          : "Koneksi database gagal."
      );
    }
  }
  laporan.latensi_ms = Date.now() - mulai;

  if (laporan.tabel_user_ada && !laporan.admin_ada) {
    laporan.masalah.push(
      `User "${adminUsername}" belum ada di database. Jalankan: npm run db:seed`
    );
  }

  laporan.ok = laporan.masalah.length === 0;
  laporan.error = laporan.masalah.length > 0 ? laporan.masalah.join(" ") : null;

  const reveal =
    process.env.HEALTH_DETAIL === "true" || dariLokal(request);

  if (!reveal) {
    laporan.error = laporan.ok
      ? null
      : "Ada masalah konfigurasi. Hubungi admin.";
    laporan.masalah = laporan.ok
      ? []
      : ["Ada masalah konfigurasi. Hubungi admin."];
  }

  return Response.json(laporan, {
    status: laporan.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}