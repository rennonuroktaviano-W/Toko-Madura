import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async (request, ctx) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;

  const transaksi = await prisma.transaksi.findUnique({
    where: { id: String(id) },
    include: {
      kasir: { select: { id: true, nama: true, username: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  if (!transaksi) {
    return Response.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return Response.json(transaksi);
}, "GET /api/transaksi/[id]");

export const PATCH = denganDb(async (request, ctx) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  if (body?.aksi !== "lunas") {
    return Response.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  }

  const transaksi = await prisma.transaksi.findUnique({ where: { id: String(id) } });
  if (!transaksi) {
    return Response.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  if (transaksi.status === "Selesai") {
    const lengkap = await prisma.transaksi.findUnique({
      where: { id: transaksi.id },
      include: {
        kasir: { select: { id: true, nama: true, username: true } },
        items: { orderBy: { id: "asc" } },
      },
    });
    return Response.json({ transaksi: lengkap });
  }

  const updated = await prisma.transaksi.update({
    where: { id: transaksi.id },
    data: {
      status: "Selesai",
      metodeBayar: "QRIS",
      jumlahBayar: transaksi.grandTotal,
      kembalian: 0,
    },
    include: {
      kasir: { select: { id: true, nama: true, username: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  return Response.json({ transaksi: updated });
}, "PATCH /api/transaksi/[id]");