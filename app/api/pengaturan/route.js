import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { namaValid, MAX_NAMA } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT = {
  namaToko: "Warung Madura",
  alamat: "",
  tagline: "Warung Kelontong 24 Jam",
};

function bersihkan(body) {
  const namaToko = String(body?.namaToko ?? "").trim();
  const alamat = String(body?.alamat ?? "").trim();
  const tagline = String(body?.tagline ?? "").trim();

  if (!namaValid(namaToko)) {
    return {
      error: `Nama toko wajib diisi, maksimal ${MAX_NAMA} karakter`,
    };
  }
  if (alamat.length > MAX_NAMA) {
    return { error: `Alamat terlalu panjang, maksimal ${MAX_NAMA} karakter` };
  }
  if (tagline.length > MAX_NAMA) {
    return { error: `Tagline terlalu panjang, maksimal ${MAX_NAMA} karakter` };
  }

  return {
    data: {
      namaToko,
      alamat: alamat || DEFAULT.alamat,
      tagline: tagline || DEFAULT.tagline,
    },
  };
}

export const GET = denganDb(async () => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const pengaturan = await prisma.pengaturan.findFirst({ orderBy: { id: "asc" } });
  return Response.json(pengaturan ?? { id: null, ...DEFAULT });
}, "GET /api/pengaturan");

export const PUT = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const hasil = bersihkan(body);
  if (hasil.error) {
    return Response.json({ error: hasil.error }, { status: 400 });
  }

  const sekarang = await prisma.pengaturan.findFirst({ orderBy: { id: "asc" } });

  const pengaturan = sekarang
    ? await prisma.pengaturan.update({ where: { id: sekarang.id }, data: hasil.data })
    : await prisma.pengaturan.create({ data: { id: 1, ...hasil.data } });

  return Response.json(pengaturan);
}, "PUT /api/pengaturan");