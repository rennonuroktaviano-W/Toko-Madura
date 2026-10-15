import { prisma } from "./db";
import { rupiah } from "./format";
import { MAX_CATATAN } from "./validasi";
import { tanggalWIB } from "./wib";

export class GalatTransaksi extends Error {
  constructor(pesan, status = 400) {
    super(pesan);
    this.name = "GalatTransaksi";
    this.status = status;
  }
}

export function responseGalat(err) {
  if (err instanceof GalatTransaksi) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  throw err;
}

export function bacaItems(body) {
  const raw = Array.isArray(body?.items) ? body.items : [];
  if (raw.length === 0) {
    throw new GalatTransaksi("Keranjang masih kosong");
  }

  return raw.map((it) => {
    const produkId = Number(it?.produkId);
    const qty = Number(it?.qty);
    if (!Number.isInteger(produkId) || produkId <= 0) {
      throw new GalatTransaksi("Daftar belanja tidak valid");
    }
    if (!Number.isInteger(qty) || qty <= 0 || qty > 999) {
      throw new GalatTransaksi("Jumlah barang tidak valid (maksimal 999 per item)");
    }
    return {
      produkId,
      qty,
      catatan: it?.catatan ? String(it.catatan).trim().slice(0, MAX_CATATAN) : null,
    };
  });
}

export function nomorTransaksiBaru(awalan = "TRX") {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${awalan}-${tanggalWIB().replaceAll("-", "")}-${rand}`;
}

export async function buatTransaksi({
  items,
  metodeBayar,
  jumlahBayar = 0,
  kasirId = null,
  requestId,
}) {
  if (requestId) {
    const existing = await prisma.transaksi.findFirst({
      where: { requestId },
      include: {
        kasir: { select: { id: true, nama: true, username: true } },
        items: { orderBy: { id: "asc" } },
      },
    });
    if (existing) {
      return existing;
    }
  }

  const produkIds = items.map((i) => i.produkId);
  const produkList = await prisma.produk.findMany({
    where: { id: { in: produkIds } },
  });
  const produkMap = new Map(produkList.map((p) => [p.id, p]));

  for (const it of items) {
    const p = produkMap.get(it.produkId);
    if (!p || p.status !== "aktif") {
      throw new GalatTransaksi("Ada barang yang tidak tersedia");
    }
    if (p.stok < it.qty) {
      throw new GalatTransaksi(`Stok "${p.nama}" tidak cukup (sisa ${p.stok})`);
    }
  }

  const subtotal = items.reduce((acc, it) => {
    return acc + produkMap.get(it.produkId).harga * it.qty;
  }, 0);
  const grandTotal = subtotal;
  const jumlahItem = items.reduce((acc, it) => acc + it.qty, 0);

  let bayar = grandTotal;
  let kembalian = 0;
  if (metodeBayar === "Tunai") {
    if (!Number.isFinite(jumlahBayar)) {
      throw new GalatTransaksi("Nominal bayar tunai wajib diisi");
    }
    if (jumlahBayar < grandTotal) {
      throw new GalatTransaksi(
        `Uang kurang: ${rupiah(grandTotal - jumlahBayar)}`
      );
    }
    bayar = Math.round(jumlahBayar);
    kembalian = bayar - grandTotal;
  }

  const MAKS_COBA = 3;
  for (let percobaan = 0; percobaan < MAKS_COBA; percobaan++) {
    try {
      return await prisma.$transaction(async (tx) => {
        for (const it of items) {
          const upd = await tx.produk.updateMany({
            where: { id: it.produkId, stok: { gte: it.qty }, status: "aktif" },
            data: { stok: { decrement: it.qty } },
          });
          if (upd.count === 0) {
            throw new Error(`STOK_KURANG:${it.produkId}`);
          }
        }

        const dataCreate = {
          noTransaksi: nomorTransaksiBaru(),
          kasirId,
          subtotal,
          grandTotal,
          jumlahItem,
          metodeBayar,
          jumlahBayar: bayar,
          kembalian,
          items: {
            create: items.map((it) => {
              const p = produkMap.get(it.produkId);
              return {
                produkId: p.id,
                nama: p.nama,
                hargaSatuan: p.harga,
                qty: it.qty,
                subtotal: p.harga * it.qty,
                catatan: it.catatan,
              };
            }),
          },
        };
        if (requestId) dataCreate.requestId = requestId;

        return tx.transaksi.create({
          data: dataCreate,
          include: {
            kasir: { select: { id: true, nama: true, username: true } },
            items: { orderBy: { id: "asc" } },
          },
        });
      });
    } catch (e) {
      if (typeof e?.message === "string" && e.message.startsWith("STOK_KURANG:")) {
        const produkId = Number(e.message.split(":")[1]);
        const p = produkMap.get(produkId);
        throw new GalatTransaksi(
          `Stok "${p?.nama ?? "barang"}" tidak cukup saat diproses`,
          409
        );
      }
      if (e?.code === "P2002") {
        const target = e.meta?.target;
        const sebutan = Array.isArray(target) ? target.join(",") : String(target ?? "");
        if (sebutan.includes("requestId")) {
          const existing = await prisma.transaksi.findUnique({
            where: { requestId },
            include: {
              kasir: { select: { id: true, nama: true, username: true } },
              items: { orderBy: { id: "asc" } },
            },
          });
          if (existing) return existing;
        }
        if (sebutan.includes("noTransaksi") && percobaan < MAKS_COBA - 1) {
          continue;
        }
      }
      throw e;
    }
  }

  throw new GalatTransaksi("Gagal menyimpan transaksi, coba lagi", 500);
}