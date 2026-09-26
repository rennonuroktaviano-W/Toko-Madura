import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export async function GET() {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const now = new Date();
  const startHariIni = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endHariIni = new Date(startHariIni);
  endHariIni.setDate(endHariIni.getDate() + 1);

  const mulai7Hari = new Date(startHariIni);
  mulai7Hari.setDate(mulai7Hari.getDate() - 6);

  const [
    omzetHariIni,
    jmlTrxHariIni,
    jmlItemHariIni,
    omzetTotal,
    jmlTrxTotal,
    produkAktif,
    barangTerlaris,
    stokMenipis,
    transaksi7Hari,
  ] =
    await Promise.all([
      prisma.transaksi.aggregate({
        _sum: { grandTotal: true },
        where: { tanggal: { gte: startHariIni, lt: endHariIni } },
      }),
      prisma.transaksi.count({
        where: { tanggal: { gte: startHariIni, lt: endHariIni } },
      }),
      prisma.transaksi.aggregate({
        _sum: { jumlahItem: true },
        where: { tanggal: { gte: startHariIni, lt: endHariIni } },
      }),
      prisma.transaksi.aggregate({ _sum: { grandTotal: true } }),
      prisma.transaksi.count(),
      prisma.produk.count({ where: { status: "aktif" } }),
      prisma.itemTransaksi.groupBy({
        by: ["nama"],
        _sum: { qty: true, subtotal: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 5,
      }),
      prisma.produk.findMany({
        where: { status: "aktif", stok: { lte: 5 } },
        orderBy: { stok: "asc" },
        include: { kategori: true },
        take: 8,
      }),
      prisma.transaksi.findMany({
        where: { tanggal: { gte: mulai7Hari, lt: endHariIni } },
        select: { tanggal: true, grandTotal: true },
      }),
    ]);

  const omzetPerHari = new Map();
  for (const t of transaksi7Hari) {
    const d = new Date(t.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    omzetPerHari.set(key, (omzetPerHari.get(key) ?? 0) + (t.grandTotal ?? 0));
  }

  const tren7Hari = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startHariIni);
    d.setDate(d.getDate() - i);
    tren7Hari.push({
      label: HARI[d.getDay()],
      tanggal: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      omzet: omzetPerHari.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? 0,
    });
  }

  return Response.json({
    omzetHariIni: omzetHariIni._sum.grandTotal ?? 0,
    jmlTrxHariIni,
    jmlItemHariIni: jmlItemHariIni._sum.jumlahItem ?? 0,
    omzetTotal: omzetTotal._sum.grandTotal ?? 0,
    jmlTrxTotal,
    produkAktif,
    barangTerlaris: barangTerlaris.map((b) => ({
      nama: b.nama,
      qty: b._sum.qty ?? 0,
      subtotal: b._sum.subtotal ?? 0,
    })),
    stokMenipis,
    tren7Hari,
  });
}