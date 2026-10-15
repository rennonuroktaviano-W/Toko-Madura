import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { rentangHariWIB, tanggalValid } from "@/lib/wib";
import { bacaItems, buatTransaksi, responseGalat } from "@/lib/transaksi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const dari = url.searchParams.get("dari");
  const sampai = url.searchParams.get("sampai");

  for (const nilai of [dari, sampai]) {
    if (nilai && !tanggalValid(nilai)) {
      return Response.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }
  }

  const where = {};
  if (dari) where.tanggal = { gte: rentangHariWIB(dari).gte };
  if (sampai) {
    where.tanggal = { ...(where.tanggal || {}), lt: rentangHariWIB(sampai).lt };
  }

  const [transaksis, agregat, menunggu] = await Promise.all([
    prisma.transaksi.findMany({
      where,
      include: {
        kasir: { select: { id: true, nama: true } },
        _count: { select: { items: true } },
      },
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      take: 200,
    }),
    prisma.transaksi.aggregate({
      where: { ...where, status: "Selesai" },
      _count: { _all: true },
      _sum: { grandTotal: true },
    }),
    prisma.transaksi.count({ where: { ...where, status: "MenungguPembayaran" } }),
  ]);

  const jumlah = agregat._count._all;
  return Response.json({
    transaksis,
    ringkasan: {
      omzet: agregat._sum.grandTotal ?? 0,
      jumlah,
      menunggu,
      terpotong: jumlah + menunggu > transaksis.length,
    },
  });
}, "GET /api/transaksi");

export const POST = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  try {
    const requestId = body?.requestId || crypto.randomUUID();
    const transaksi = await buatTransaksi({
      items: bacaItems(body),
      metodeBayar: body?.metodeBayar === "QRIS" ? "QRIS" : "Tunai",
      jumlahBayar: Number(body?.jumlahBayar),
      kasirId: Number(user.sub),
      awalanNo: "TRX",
      requestId,
    });

    return Response.json({ transaksi }, { status: 201 });
  } catch (e) {
    return responseGalat(e);
  }
}, "POST /api/transaksi");