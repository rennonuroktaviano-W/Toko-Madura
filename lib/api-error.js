import { databaseTerpasang } from "./adapter";

export const KODE = {
  DB_BELUM_DIATURKAN: "DB_BELUM_DIATURKAN",
  DB_GAGAL: "DB_GAGAL",
  AUTH_BELUM_DIATURKAN: "AUTH_BELUM_DIATURKAN",
  INTERNAL: "INTERNAL",
};

export const PESAN = {
  [KODE.DB_BELUM_DIATURKAN]:
    "Aplikasi belum siap dipakai. Hubungi admin untuk pengaturan.",
  [KODE.DB_GAGAL]:
    "Database sedang tidak bisa dihubungi. Coba lagi sebentar atau hubungi admin.",
  [KODE.AUTH_BELUM_DIATURKAN]:
    "Aplikasi belum siap dipakai. Hubungi admin untuk pengaturan.",
  [KODE.INTERNAL]: "Terjadi kesalahan di server. Coba lagi.",
};

const KODE_KONFIGURASI = /^DATABASE_URL belum diset/;
const KODE_AUTH_SECRET = /^AUTH_SECRET belum diset/;

const KODE_JEBOL = new Set(["P1001", "P1002", "P1017", "P2034", "P2039"]);

const POLA_JEBOL =
  /P1001|P1002|P1017|P2034|P2039|ER_ACCESS_DENIED|ER_BAD_DB|ER_DBACCESS_DENIED|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EHOSTUNREACH|EPIPE|ER_CON_COUNT_ERROR|ER_SERVER_SHUTDOWN|pool|Connection is closed|TimeoutError|self-signed|certificate|SSL|TLS/i;

export function klasifikasiError(err) {
  const pesan = String(err?.message ?? "");
  const kode = err?.code ? String(err.code) : "";

  if (KODE_KONFIGURASI.test(pesan)) return KODE.DB_BELUM_DIATURKAN;
  if (KODE_AUTH_SECRET.test(pesan)) return KODE.AUTH_BELUM_DIATURKAN;
  if (KODE_JEBOL.has(kode) || POLA_JEBOL.test(pesan)) return KODE.DB_GAGAL;
  return null;
}

export function dbBelumSiap() {
  return !databaseTerpasang();
}

export function respondError(kode, { detail } = {}) {
  return Response.json(
    { kode, error: PESAN[kode], ...(detail ? { detail } : {}) },
    { status: kode === KODE.INTERNAL ? 500 : 503, headers: { "Cache-Control": "no-store" } }
  );
}

export function tanganiRoute(err, konteks = "Route") {
  const kode = klasifikasiError(err);
  if (kode) return respondError(kode);
  console.error(`[api] ${konteks}:`, err);
  return respondError(KODE.INTERNAL, {
    detail: process.env.NODE_ENV === "production" ? undefined : String(err?.message ?? err),
  });
}

export function denganDb(handler, konteks) {
  return async (...args) => {
    if (dbBelumSiap()) return respondError(KODE.DB_BELUM_DIATURKAN);
    try {
      return await handler(...args);
    } catch (err) {
      return tanganiRoute(err, konteks);
    }
  };
}
