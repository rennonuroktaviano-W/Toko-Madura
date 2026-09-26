import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { namaValid } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = denganDb(async (request, ctx) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const produkId = Number(id);
  if (!Number.isInteger(produkId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const nama = body?.nama !== undefined ? String(body.nama).trim() : undefined;
  const kategoriId = body?.kategoriId !== undefined ? Number(body.kategoriId) : undefined;
  const harga = body?.harga !== undefined ? Number(body.harga) : undefined;
  const satuan = body?.satuan !== undefined ? String(body.satuan).trim() || "pcs" : undefined;
  const fotoUrl =
    body?.fotoUrl !== undefined
      ? String(body.fotoUrl).trim() || null
      : undefined;
  const status =
    body?.status === "aktif" || body?.status === "nonaktif"
      ? body.status
      : undefined;

  const data = {};
  if (nama !== undefined) {
    if (!namaValid(nama)) {
      return Response.json(
        { error: "Nama barang wajib diisi, maksimal 191 karakter" },
        { status: 400 }
      );
    }
    data.nama = nama;
  }
  if (kategoriId !== undefined) {
    if (!Number.isInteger(kategoriId) || kategoriId <= 0) {
      return Response.json({ error: "Pilih kategori barang" }, { status: 400 });
    }
    data.kategoriId = kategoriId;
  }
  if (harga !== undefined) {
    if (!Number.isFinite(harga) || harga < 0) {
      return Response.json({ error: "Harga tidak valid" }, { status: 400 });
    }
    data.harga = Math.round(harga);
  }
  if (satuan) data.satuan = satuan;
  if (fotoUrl !== undefined) data.fotoUrl = fotoUrl;
  if (status) data.status = status;

  try {
    const updated = await prisma.produk.update({
      where: { id: produkId },
      data,
      include: { kategori: true },
    });
    return Response.json(updated);
  } catch (e) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }
    if (e?.code === "P2003") {
      return Response.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }
    throw e;
  }
}, "PUT /api/produk/[id]");

export const DELETE = denganDb(async (request, ctx) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const produkId = Number(id);
  if (!Number.isInteger(produkId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await prisma.produk.delete({ where: { id: produkId } });
    return Response.json({ ok: true });
  } catch (e) {
    if (e?.code === "P2003") {
      return Response.json(
        {
          error:
            "Barang ini pernah dipakai di transaksi (riwayat struk harus dipertahankan). Set status menjadi Nonaktif sebagai gantinya.",
        },
        { status: 409 }
      );
    }
    if (e?.code === "P2025") {
      return Response.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }
    throw e;
  }
}, "DELETE /api/produk/[id]");