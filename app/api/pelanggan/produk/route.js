import { prisma } from "@/lib/db";
import { denganDb } from "@/lib/api-error";
import { pelangganSekarang } from "@/lib/pelanggan";
import { terlaluSering, kunciIp, terlaluSeringResponse } from "@/lib/api-publik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async (request) => {
  if (
    terlaluSering(`produk:${kunciIp(request)}`, {
      maks: 240,
      jendelaMs: 60 * 1000,
    })
  ) {
    return terlaluSeringResponse();
  }

  await pelangganSekarang();

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 191);

  const produk = await prisma.produk.findMany({
    where: {
      status: "aktif",
      stok: { gt: 0 },
      ...(q ? { nama: { contains: q } } : {}),
    },
    select: {
      id: true,
      nama: true,
      harga: true,
      satuan: true,
      stok: true,
      fotoUrl: true,
      kategori: { select: { id: true, nama: true, warna: true } },
    },
    orderBy: { nama: "asc" },
    take: 300,
  });

  const kategoris = await prisma.kategori.findMany({
    where: { produks: { some: { status: "aktif", stok: { gt: 0 } } } },
    select: { id: true, nama: true, warna: true },
    orderBy: { nama: "asc" },
  });

  return Response.json({ produk, kategoris }, { headers: { "Cache-Control": "no-store" } });
}, "GET /api/pelanggan/produk");