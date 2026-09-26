import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { namaValid, warnaValid } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = denganDb(async (request, ctx) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const kategoriId = Number(id);
  if (!Number.isInteger(kategoriId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const nama = body?.nama === undefined ? undefined : String(body.nama).trim();
  const warna = body?.warna === undefined ? undefined : String(body.warna).trim();

  if (nama !== undefined && !namaValid(nama)) {
    return Response.json(
      { error: "Nama kategori wajib diisi, maksimal 191 karakter" },
      { status: 400 }
    );
  }
  if (warna !== undefined && !warnaValid(warna)) {
    return Response.json({ error: "Warna tidak valid" }, { status: 400 });
  }

  const data = {};
  if (nama !== undefined) data.nama = nama;
  if (warna !== undefined) data.warna = warna;

  try {
    const updated = await prisma.kategori.update({
      where: { id: kategoriId },
      data,
    });
    return Response.json(updated);
  } catch (e) {
    if (e?.code === "P2002") {
      return Response.json(
        { error: "Nama kategori sudah dipakai" },
        { status: 409 }
      );
    }
    if (e?.code === "P2025") {
      return Response.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    throw e;
  }
}, "PUT /api/kategori/[id]");

export const DELETE = denganDb(async (request, ctx) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const kategoriId = Number(id);
  if (!Number.isInteger(kategoriId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await prisma.kategori.delete({ where: { id: kategoriId } });
    return Response.json({ ok: true });
  } catch (e) {
    if (e?.code === "P2003") {
      return Response.json(
        { error: "Kategori masih berisi produk. Pindahkan atau hapus produknya dulu." },
        { status: 409 }
      );
    }
    if (e?.code === "P2025") {
      return Response.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    throw e;
  }
}, "DELETE /api/kategori/[id]");