import { prisma } from "@/lib/db";
import { denganDb } from "@/lib/api-error";
import { pelangganSekarang } from "@/lib/pelanggan";
import {
  dariSitusSendiri,
  kunciIp,
  terlaluSering,
  terlaluSeringResponse,
  tolakAsalLain,
} from "@/lib/api-publik";
import { bacaItems, buatTransaksi, responseGalat } from "@/lib/transaksi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PESAN_TUNAI =
  "Pembayaran tunai belum tersedia untuk pesanan online. Pilih QRIS.";

export const GET = denganDb(async (request) => {
  if (
    terlaluSering(`pesanan:${kunciIp(request)}`, { maks: 120, jendelaMs: 60 * 1000 })
  ) {
    return terlaluSeringResponse();
  }

  const pelanggan = await pelangganSekarang();

  const pesanan = await prisma.transaksi.findMany({
    where: { sumber: "Order", pelangganId: pelanggan.id },
    select: {
      id: true,
      noTransaksi: true,
      tanggal: true,
      grandTotal: true,
      jumlahItem: true,
      metodeBayar: true,
      status: true,
      items: {
        select: { id: true, nama: true, qty: true, hargaSatuan: true, subtotal: true },
        orderBy: { id: "asc" },
      },
    },
    orderBy: [{ tanggal: "desc" }, { id: "desc" }],
    take: 20,
  });

  return Response.json({ pesanan }, { headers: { "Cache-Control": "no-store" } });
}, "GET /api/pelanggan/pesanan");

export const POST = denganDb(async (request) => {
  if (!dariSitusSendiri(request)) return tolakAsalLain();

  const ip = kunciIp(request);
  if (
    terlaluSering(`buat:${ip}`, { maks: 10, jendelaMs: 10 * 60 * 1000 })
  ) {
    return terlaluSeringResponse();
  }

  const pelanggan = await pelangganSekarang();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  if (body?.metodeBayar === "Tunai") {
    return Response.json({ error: PESAN_TUNAI }, { status: 400 });
  }

  try {
    const transaksi = await buatTransaksi({
      items: bacaItems(body),
      metodeBayar: "QRIS",
      jumlahBayar: 0,
      pelangganId: pelanggan.id,
      sumber: "Order",
      status: "MenungguPembayaran",
      awalanNo: "ORD",
      catatPembayaran: false,
    });

    return Response.json({ transaksi }, { status: 201 });
  } catch (e) {
    return responseGalat(e);
  }
}, "POST /api/pelanggan/pesanan");