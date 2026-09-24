"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rupiah, formatTanggalWaktu } from "@/lib/format";

export default function RiwayatPage() {
  const router = useRouter();
  const [transaksis, setTransaksis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [jumlahTrx, setJumlahTrx] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dari) params.set("dari", dari);
    if (sampai) params.set("sampai", sampai);
    try {
      const res = await fetch(`/api/transaksi?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTransaksis(data);
      setTotalOmzet(data.reduce((s, t) => s + t.grandTotal, 0));
      setJumlahTrx(data.length);
    } finally {
      setLoading(false);
    }
  }, [dari, sampai]);

  useEffect(() => {
    load();
  }, [load]);

  function hariIni() {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    setDari(iso);
    setSampai(iso);
  }

  function hapusFilter() {
    setDari("");
    setSampai("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-warung-coklat lg:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-warung-coklat/60">
            Lihat semua transaksi yang pernah terjadi dan unduh ulang struk.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border-2 border-warung-kuningtua/30 bg-white p-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-bold text-warung-coklat">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
            className="rounded-xl border-2 border-amber-200 bg-warung-krem px-3 py-2.5 outline-none focus:border-warung-oranye"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-warung-coklat">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={sampai}
            onChange={(e) => setSampai(e.target.value)}
            className="rounded-xl border-2 border-amber-200 bg-warung-krem px-3 py-2.5 outline-none focus:border-warung-oranye"
          />
        </div>
        <button
          onClick={hariIni}
          className="rounded-xl bg-warung-kuning px-4 py-2.5 text-sm font-extrabold text-warung-coklat transition hover:bg-amber-400"
        >
          Hari Ini
        </button>
        <button
          onClick={hapusFilter}
          className="rounded-xl bg-warung-krem px-4 py-2.5 text-sm font-bold text-warung-coklat transition hover:bg-amber-100"
        >
          Semua
        </button>
        <div className="sm:ml-auto text-right">
          <p className="text-xs font-bold text-warung-coklat/60">
            Omzet di rentang ini
          </p>
          <p className="break-words font-display text-xl font-extrabold text-warung-oranye sm:text-2xl">
            {rupiah(totalOmzet)}
          </p>
          <p className="text-xs font-semibold text-warung-coklat/60">
            {jumlahTrx} transaksi
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-warung-coklat/60">Memuat...</p>
      ) : (
        <div className="mt-5 space-y-3">
          {transaksis.map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(`/transaksi/${t.id}`)}
              className="flex w-full flex-col gap-2 rounded-2xl border-2 border-amber-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-warung-kuningtua hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-extrabold text-warung-coklat">
                  {t.noTransaksi}
                </p>
                <p className="text-xs font-semibold text-warung-coklat/50">
                  {formatTanggalWaktu(t.tanggal)} • Kasir: {t.kasir?.nama}
                </p>
              </div>
              <div className="text-sm font-bold text-warung-coklat/70">
                {t._count.items} item
              </div>
              <div className="text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                    t.metodeBayar === "QRIS"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-warung-hijau"
                  }`}
                >
                  {t.metodeBayar}
                </span>
              </div>
              <div className="sm:w-36 sm:text-right">
                <p className="break-words font-extrabold text-warung-oranye">
                  {rupiah(t.grandTotal)}
                </p>
                <p className="text-xs font-semibold text-warung-hijau">
                  Lihat Struk →
                </p>
              </div>
            </button>
          ))}
          {transaksis.length === 0 && (
            <p className="rounded-2xl bg-white py-10 text-center text-warung-coklat/60">
              Tidak ada transaksi pada rentang tanggal ini.
            </p>
          )}
        </div>
      )}
    </div>
  );
}