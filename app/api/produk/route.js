import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { namaValid } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const kategoriParam = url.searchParams.get("kategori");
  const q = url.searchParams.get("q")?.trim().slice(0, 191);
  const status = url.searchParams.get("status");

  if (status && !["aktif", "nonaktif", "semua"].includes(status)) {
    return Response.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const where = {};
  if (kategoriParam && kategoriParam !== "semua") {
    const kategoriId = Number(kategoriParam);
    if (!Number.isInteger(kategoriId) || kategoriId <= 0) {
      return Response.json({ error: "Kategori tidak valid" }, { status: 400 });
    }
    where.kategoriId = kategoriId;
  }
  if (q) where.nama = { contains: q };
  if (status && status !== "semua") where.status = status;

  const produks = await prisma.produk.findMany({
    where,
    include: { kategori: true },
    orderBy: { nama: "asc" },
  });
  return Response.json(produks);
}, "GET /api/produk");

export const POST = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const nama = String(body?.nama ?? "").trim();
  const kategoriId = Number(body?.kategoriId);
  const harga = Number(body?.harga);
  const stok = Number(body?.stok ?? 0);
  const satuan = String(body?.satuan ?? "pcs").trim() || "pcs";
  const fotoUrl = body?.fotoUrl ? String(body.fotoUrl).trim() : null;
  const status = body?.status === "nonaktif" ? "nonaktif" : "aktif";

  if (!namaValid(nama)) {
    return Response.json(
      { error: "Nama barang wajib diisi, maksimal 191 karakter" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(kategoriId) || kategoriId <= 0) {
    return Response.json({ error: "Pilih kategori barang" }, { status: 400 });
  }
  if (!Number.isFinite(harga) || harga < 0) {
    return Response.json({ error: "Harga tidak valid" }, { status: 400 });
  }

  const kategori = await prisma.kategori.findUnique({ where: { id: kategoriId } });
  if (!kategori) {
    return Response.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }

  const created = await prisma.produk.create({
    data: {
      nama,
      kategoriId,
      harga: Math.round(harga),
      stok: Math.max(0, Math.round(stok)),
      satuan,
      fotoUrl,
      status,
    },
    include: { kategori: true },
  });
  return Response.json(created, { status: 201 });
}, "POST /api/produk");