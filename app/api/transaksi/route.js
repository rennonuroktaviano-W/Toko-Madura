import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateNoTransaksi() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRX-${date}-${rand}`;
}

export async function POST(request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const metodeBayar = body?.metodeBayar === "QRIS" ? "QRIS" : "Tunai";
  const jumlahBayar = Number(body?.jumlahBayar);

  if (rawItems.length === 0) {
    return Response.json({ error: "Keranjang masih kosong" }, { status: 400 });
  }

  const items = [];
  for (const it of rawItems) {
    const produkId = Number(it?.produkId);
    const qty = Number(it?.qty);
    if (!Number.isInteger(produkId) || !Number.isInteger(qty) || qty <= 0) {
      return Response.json(
        { error: "Daftar belanja tidak valid" },
        { status: 400 }
      );
    }
    items.push({
      produkId,
      qty,
      catatan: it?.catatan ? String(it.catatan).trim().slice(0, 200) : null,
    });
  }

  const produkIds = items.map((i) => i.produkId);
  const produkList = await prisma.produk.findMany({ where: { id: { in: produkIds } } });
  const produkMap = new Map(produkList.map((p) => [p.id, p]));

  for (const it of items) {
    const p = produkMap.get(it.produkId);
    if (!p || p.status !== "aktif") {
      return Response.json(
        { error: "Ada barang yang tidak tersedia" },
        { status: 400 }
      );
    }
    if (p.stok < it.qty) {
      return Response.json(
        { error: `Stok "${p.nama}" tidak cukup (sisa ${p.stok})` },
        { status: 400 }
      );
    }
  }

  const subtotal = items.reduce((acc, it) => {
    const p = produkMap.get(it.produkId);
    return acc + p.harga * it.qty;
  }, 0);
  const grandTotal = subtotal;
  const jumlahItem = items.reduce((acc, it) => acc + it.qty, 0);

  let bayar = grandTotal;
  let kembalian = 0;
  if (metodeBayar === "Tunai") {
    if (!Number.isFinite(jumlahBayar)) {
      return Response.json(
        { error: "Nominal bayar tunai wajib diisi" },
        { status: 400 }
      );
    }
    if (jumlahBayar < grandTotal) {
      return Response.json(
        { error: `Uang kurang: ${grandTotal - jumlahBayar}` },
        { status: 400 }
      );
    }
    bayar = Math.round(jumlahBayar);
    kembalian = bayar - grandTotal;
  }

  const kasirId = Number(user.sub);

  let transaksi;
  try {
    transaksi = await prisma.$transaction(async (tx) => {
      for (const it of items) {
        const upd = await tx.produk.updateMany({
          where: { id: it.produkId, stok: { gte: it.qty }, status: "aktif" },
          data: { stok: { decrement: it.qty } },
        });
        if (upd.count === 0) {
          throw new Error(`STOK_KURANG:${it.produkId}`);
        }
      }

      const trx = await tx.transaksi.create({
        data: {
          noTransaksi: generateNoTransaksi(),
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
        },
        include: {
          kasir: { select: { id: true, nama: true, username: true } },
          items: true,
        },
      });
      return trx;
    });
  } catch (e) {
    if (typeof e?.message === "string" && e.message.startsWith("STOK_KURANG:")) {
      const pid = Number(e.message.split(":")[1]);
      const p = produkMap.get(pid);
      return Response.json(
        { error: `Stok "${p?.nama ?? "barang"}" tidak cukup saat diproses` },
        { status: 409 }
      );
    }
    throw e;
  }

  return Response.json({ transaksi }, { status: 201 });
}