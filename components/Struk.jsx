"use client";

import { formatAngka, formatTanggalWaktu } from "@/lib/format";

const rp = formatAngka;

function GarisDashed() {
  return <div className="my-2 border-t border-dashed border-black/60" />;
}

export default function Struk({ transaksi, pengaturan }) {
  const waktu = formatTanggalWaktu(transaksi.tanggal);

  return (
    <div className="mx-auto w-[300px] bg-white px-4 py-3 font-mono text-[13px] leading-snug text-black">
      <div className="text-center">
        <p className="text-base font-extrabold tracking-tight">
          {pengaturan?.namaToko || "Warung Madura"}
        </p>
        <p className="text-[11px]">{pengaturan?.alamat}</p>
        <p className="text-[11px] font-bold text-gray-700">
          {pengaturan?.tagline}
        </p>
      </div>

      <GarisDashed />

      <div className="space-y-0.5 text-[12px]">
        <p>
          <span className="font-bold">No:</span> {transaksi.noTransaksi}
        </p>
        <p>
          <span className="font-bold">Tgl:</span> {waktu}
        </p>
        <p>
          <span className="font-bold">Kasir:</span> {transaksi.kasir?.nama || "-"}
        </p>
      </div>

      <GarisDashed />

      <div className="space-y-2">
        {transaksi.items.map((it) => (
          <div key={it.id}>
            <p className="font-bold">{it.nama}</p>
            {it.catatan && (
              <p className="text-[11px] text-gray-600">{it.catatan}</p>
            )}
            <p className="flex justify-between gap-2">
              <span>
                {it.qty} x @{rp(it.hargaSatuan)}
              </span>
              <span className="font-semibold">{rp(it.subtotal)}</span>
            </p>
          </div>
        ))}
      </div>

      <GarisDashed />

      <div className="space-y-1 text-[12px]">
        <p className="flex justify-between">
          <span>Jumlah item</span>
          <span>{transaksi.jumlahItem} item</span>
        </p>
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{rp(transaksi.subtotal)}</span>
        </p>
        <p className="flex justify-between text-base font-extrabold">
          <span>TOTAL</span>
          <span>{rp(transaksi.grandTotal)}</span>
        </p>
        <GarisDashed />
        <p className="flex justify-between">
          <span>Bayar ({transaksi.metodeBayar})</span>
          <span>{rp(transaksi.jumlahBayar)}</span>
        </p>
        {transaksi.metodeBayar === "Tunai" && (
          <p className="flex justify-between">
            <span>Kembalian</span>
            <span>{rp(transaksi.kembalian)}</span>
          </p>
        )}
      </div>

      <GarisDashed />

      <div className="text-center">
        <p className="font-bold">~ Terima Kasih ~</p>
        <p className="text-[10px] text-gray-500">Powered by Kasir Warung Madura</p>
      </div>
    </div>
  );
}