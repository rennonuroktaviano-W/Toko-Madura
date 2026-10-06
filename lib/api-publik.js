const HITUNGAN = new Map();

export function kunciIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "lokal";
}

export function dariSitusSendiri(request) {
  const situs = request.headers.get("sec-fetch-site");
  if (situs) return situs === "same-origin" || situs === "none";

  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function terlaluSering(kunci, { maks, jendelaMs }) {
  const sekarang = Date.now();
  const entri = HITUNGAN.get(kunci);

  if (!entri || sekarang >= entri.reset) {
    HITUNGAN.set(kunci, { jumlah: 1, reset: sekarang + jendelaMs });
  } else {
    entri.jumlah += 1;
    if (entri.jumlah > maks) return true;
  }

  if (HITUNGAN.size > 5000) {
    for (const [k, v] of HITUNGAN) {
      if (sekarang >= v.reset) HITUNGAN.delete(k);
    }
  }

  return false;
}

export function tolakAsalLain() {
  return Response.json(
    { error: "Permintaan ditolak. Buka halaman pemesanan dari aplikasi." },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}

export function terlaluSeringResponse() {
  return Response.json(
    { error: "Terlalu banyak permintaan. Coba lagi beberapa saat lagi." },
    { status: 429, headers: { "Cache-Control": "no-store" } }
  );
}