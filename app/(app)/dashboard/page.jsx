"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rupiah } from "@/lib/format";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setData({ error: true });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const omzetHariIni = data?.omzetHariIni ?? 0;
  const jmlTrxHariIni = data?.jmlTrxHariIni ?? 0;
  const jmlItemHariIni = data?.jmlItemHariIni ?? 0;
  const produkAktif = data?.produkAktif ?? 0;
  const maksTren = Math.max(1, ...(data?.tren7Hari ?? []).map((t) => t.omzet));
  const maksTerlaris = Math.max(1, ...(data?.barangTerlaris ?? []).map((b) => b.qty));

  const stats = [
    { label: "Omzet Hari Ini", value: rupiah(omzetHariIni), icon: "💰", warna: "from-amber-400 to-warung-oranye" },
    { label: "Transaksi Hari Ini", value: jmlTrxHariIni, icon: "🧾", warna: "from-green-400 to-warung-hijau" },
    { label: "Item Terjual Hari Ini", value: jmlItemHariIni, icon: "📦", warna: "from-blue-400 to-blue-600" },
    { label: "Produk Aktif", value: produkAktif, icon: "🏪", warna: "from-purple-400 to-purple-600" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-warung-coklat lg:text-3xl">
            👋 Selamat Datang, {data?.error ? "" : "Kasir"}!
          </h1>
          <p className="text-sm text-warung-coklat/60">
            Ringkasan penjualan warung hari ini.
          </p>
        </div>
        <button
          onClick={() => router.push("/kasir")}
          className="rounded-2xl border-b-4 border-warung-kuningtua bg-warung-kuning px-5 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
        >
          🧾 Buka Kasir
        </button>
      </div>

      {!data ? (
        <p className="mt-10 text-center text-warung-coklat/60">Memuat dashboard...</p>
      ) : data.error ? (
        <p className="mt-10 text-center text-warung-coklat/60">
          Gagal memuat data dashboard.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`rounded-3xl bg-gradient-to-br ${s.warna} p-4 text-white shadow-lg`}
              >
                <p className="text-2xl">{s.icon}</p>
                <p className="mt-2 text-2xl font-extrabold leading-tight">{s.value}</p>
                <p className="text-xs font-semibold text-white/80">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border-2 border-amber-100 bg-white p-5 lg:col-span-2">
              <h2 className="font-display text-lg font-extrabold text-warung-coklat">
                📈 Penjualan 7 Hari Terakhir
              </h2>
              <div className="mt-4 flex h-48 items-end gap-2">
                {(data.tren7Hari ?? []).map((t) => (
                  <div key={t.tanggal} className="group flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-warung-oranye opacity-0 transition group-hover:opacity-100">
                      {rupiah(t.omzet).replace(/Rp\s?/, "Rp")}
                    </span>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-warung-oranye to-amber-300 transition group-hover:from-orange-600"
                      style={{ height: `${Math.max(4, (t.omzet / maksTren) * 100)}%` }}
                      title={`${t.tanggal}: ${rupiah(t.omzet)}`}
                    />
                    <span className="text-[10px] font-bold text-warung-coklat/50">
                      {t.tanggal}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border-2 border-amber-100 bg-white p-5">
              <h2 className="font-display text-lg font-extrabold text-warung-coklat">
                🔥 Barang Terlaris
              </h2>
              <div className="mt-3 space-y-3">
                {(data.barangTerlaris ?? []).map((b, i) => (
                  <div key={b.nama} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-warung-krem text-xs font-extrabold text-warung-coklat">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-warung-coklat">{b.nama}</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-amber-100">
                        <div
                          className="h-full rounded-full bg-warung-oranye"
                          style={{ width: `${(b.qty / maksTerlaris) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="flex-none text-sm font-extrabold text-warung-oranye">
                      {b.qty}
                    </span>
                  </div>
                ))}
                {(data.barangTerlaris ?? []).length === 0 && (
                  <p className="text-sm text-warung-coklat/60">Belum ada penjualan.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border-2 border-amber-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-warung-coklat">
                ⚠️ Stok Menipis
              </h2>
              <button
                onClick={() => router.push("/barang")}
                className="text-sm font-bold text-warung-oranye hover:underline"
              >
                Kelola Barang →
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(data.stokMenipis ?? []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-warung-krem px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-warung-coklat">{p.nama}</p>
                    <p className="text-xs font-semibold text-warung-coklat/50">
                      {p.kategori?.nama}
                    </p>
                  </div>
                  <span
                    className={`flex-none rounded-full px-3 py-1 text-xs font-extrabold ${
                      p.stok === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stok === 0 ? "Habis" : `Sisa ${p.stok}`}
                  </span>
                </div>
              ))}
              {(data.stokMenipis ?? []).length === 0 && (
                <p className="text-sm text-warung-coklat/60">Semua stok aman. 🎉</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}