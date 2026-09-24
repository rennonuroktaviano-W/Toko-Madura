"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Struk from "./Struk";

export default function StrukModal({ transaksi, pengaturan, onClose, buttonClose = "Transaksi Baru", title = "Struk Transaksi" }) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!ref.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${transaksi.noTransaksi}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      window.alert("Gagal membuat gambar struk.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-6 w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-warung-coklat">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-warung-krem font-extrabold text-warung-coklat"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        <div ref={ref} className="mt-3">
          <Struk transaksi={transaksi} pengaturan={pengaturan} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="rounded-xl border-b-4 border-blue-700 bg-blue-600 px-4 py-3 font-extrabold text-white transition hover:bg-blue-500 active:border-b-0 active:translate-y-0.5"
          >
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="rounded-xl border-b-4 border-purple-700 bg-purple-600 px-4 py-3 font-extrabold text-white transition hover:bg-purple-500 active:border-b-0 active:translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Download PNG"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
        >
          {buttonClose}
        </button>
      </div>
    </div>
  );
}