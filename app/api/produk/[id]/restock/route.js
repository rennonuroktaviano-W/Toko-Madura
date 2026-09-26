import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, ctx) {
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

  const jumlah = Math.round(Number(body?.jumlah));
  if (!Number.isFinite(jumlah) || jumlah <= 0) {
    return Response.json(
      { error: "Jumlah stok harus lebih dari 0" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.produk.update({
      where: { id: produkId },
      data: { stok: { increment: jumlah } },
      include: { kategori: true },
    });
    return Response.json({ ...updated, jumlahDitambah: jumlah });
  } catch (e) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }
    throw e;
  }
}