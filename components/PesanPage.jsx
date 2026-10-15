"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTanggalWaktu, rupiah } from "@/lib/format";
import StokBadge from "@/components/StokBadge";
import Struk from "@/components/Struk";
import FotoProduk from "@/components/FotoProduk";
import { buatId } from "@/lib/id";

const TIMEOUT_MS = 15000;

async function send(path, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(path, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.error || "Terjadi kesalahan, coba lagi.");
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new Error("Server lambat merespons. Coba lagi.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export default function PesanPage({ toko }) {
  const [tab, setTab] = useState("menu");
  const [produks, setProduks] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [kategoriId, setKategoriId] = useState(0);
  const [q, setQ] = useState("");
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [cartError, setCartError] = useState("");
  const requestIdRef = useRef("");
  const [flash, setFlash] = useState("");
  const [sukses, setSukses] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [riwayatLoading, setRiwayatLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCari(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const flashTimer = useRef(null);

  const tampilkanFlash = useCallback((text) => {
    setFlash(text);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(""), 2500);
  }, []);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const loadProduk = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cari) params.set("q", cari);
      const data = await send(`/api/pelanggan/produk?${params.toString()}`);
      setProduks(data.produk);
      setKategoris(data.kategoris);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [cari]);

  useEffect(() => {
    loadProduk();
  }, [loadProduk]);

  const loadRiwayat = useCallback(async () => {
    setRiwayatLoading(true);
    try {
      const data = await send("/api/pelanggan/pesanan");
      setRiwayat(data.pesanan);
    } catch (e) {
      tampilkanFlash(e.message);
    } finally {
      setRiwayatLoading(false);
    }
  }, [tampilkanFlash]);

  useEffect(() => {
    if (tab === "riwayat") loadRiwayat();
  }, [tab, loadRiwayat]);

  const tampil = useMemo(() => {
    if (!kategoriId) return produks;
    return produks.filter((p) => p.kategori?.id === kategoriId);
  }, [produks, kategoriId]);

  const cartDetail = cart.map((c) => ({ ...c, subtotal: c.harga * c.qty }));
  const total = cartDetail.reduce((s, i) => s + i.subtotal, 0);
  const jumlahItem = cart.reduce((s, i) => s + i.qty, 0);

  function tambah(p) {
    const ada = cart.find((c) => c.produkId === p.id);
    if (ada) {
      if (ada.qty >= p.stok) {
        tampilkanFlash(`Stok ${p.nama} hanya tersisa ${p.stok}`);
        return;
      }
      setCart((prev) =>
        prev.map((c) => (c.produkId === p.id ? { ...c, qty: c.qty + 1 } : c))
      );
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        produkId: p.id,
        nama: p.nama,
        harga: p.harga,
        satuan: p.satuan,
        stok: p.stok,
        qty: 1,
      },
    ]);
    tampilkanFlash(`${p.nama} masuk keranjang`);
  }

  function inc(produkId) {
    const item = cart.find((c) => c.produkId === produkId);
    if (!item || item.qty >= item.stok) {
      if (item) tampilkanFlash(`Stok ${item.nama} hanya tersisa ${item.stok}`);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.produkId === produkId ? { ...c, qty: c.qty + 1 } : c))
    );
  }

  function dec(produkId) {
    setCart((prev) =>
      prev.map((c) => (c.produkId === produkId && c.qty > 1 ? { ...c, qty: c.qty - 1 } : c))
    );
  }

  function hapus(produkId) {
    setCart((prev) => prev.filter((c) => c.produkId !== produkId));
  }

  async function kirim() {
    setCartError("");
    if (cart.length === 0) {
      setCartError("Keranjang masih kosong.");
      return;
    }
    setSending(true);
    if (!requestIdRef.current) {
      requestIdRef.current = buatId();
    }
    const idToSend = requestIdRef.current;
    try {
      const data = await send("/api/pelanggan/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({ produkId: c.produkId, qty: c.qty })),
          metodeBayar: "QRIS",
          requestId: idToSend,
        }),
      });
      requestIdRef.current = "";
      setSukses(data.transaksi);
      setCart([]);
      setCartOpen(false);
      loadProduk();
    } catch (e) {
      setCartError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-warung-krem pb-28">
      <header className="sticky top-0 z-30 bg-warung-hijau px-4 py-3 text-white shadow-lg">
        <p className="font-display text-xl font-extrabold leading-tight">
          {toko.namaToko}
        </p>
        <p className="text-xs text-amber-200/80">
          {toko.tagline}
          {toko.alamat ? ` - ${toko.alamat}` : ""}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setTab("menu")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              tab === "menu"
                ? "bg-warung-kuning text-warung-coklat"
                : "bg-white/10 text-white/90"
            }`}
          >
            Pesan
          </button>
          <button
            onClick={() => setTab("riwayat")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              tab === "riwayat"
                ? "bg-warung-kuning text-warung-coklat"
                : "bg-white/10 text-white/90"
            }`}
          >
            Pesanan Saya
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-4">
        {flash && (
          <p className="mb-3 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-warung-coklat shadow-sm">
            {flash}
          </p>
        )}

        {sukses && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-amber-300 bg-white p-5 text-center shadow-sm">
              <p className="font-display text-lg font-extrabold text-warung-hijau">
                Pesanan terkirim
              </p>
              <p className="mt-1 text-sm text-warung-coklat/70">
                Simpan nomor pesanan di bawah ini. Bayar di toko dengan QRIS
                sambil menyebut nomor ini.
              </p>
              <p className="mt-3 font-display text-2xl font-extrabold text-warung-coklat">
                {sukses.noTransaksi}
              </p>
              <p className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                Menunggu pembayaran
              </p>
              <p className="mt-3 text-lg font-extrabold text-warung-oranje">
                {rupiah(sukses.grandTotal)}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-4 text-center">
              <p className="text-sm font-bold text-blue-900">
                Scan QRIS di kasir untuk bayar {rupiah(sukses.grandTotal)}
              </p>
              <Image
                src={toko.qrisUrl || "/qris.png"}
                alt="QRIS"
                width={752}
                height={752}
                unoptimized
                className="mx-auto mt-3 h-56 w-56 rounded-xl bg-white p-2"
              />
            </div>

            <div className="rounded-2xl border-2 border-amber-100 bg-white p-3">
              <Struk transaksi={sukses} pengaturan={toko} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSukses(null);
                  setTab("riwayat");
                }}
                className="rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-3 font-extrabold text-warung-coklat transition active:border-b-0"
              >
                Pesanan Saya
              </button>
              <button
                onClick={() => setSukses(null)}
                className="rounded-xl bg-warung-krem px-4 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-100"
              >
                Pesan Lagi
              </button>
            </div>
          </div>
        )}

        {!sukses && tab === "menu" && (
          <>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari barang..."
              className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 outline-none focus:border-warung-oranje"
            />

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setKategoriId(0)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  kategoriId === 0
                    ? "bg-warung-kuning text-warung-coklat ring-2 ring-warung-oranye"
                    : "bg-white text-warung-coklat"
                }`}
              >
                Semua
              </button>
              {kategoris.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKategoriId(k.id)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-white"
                  style={{
                    backgroundColor: kategoriId === k.id ? k.warna : `${k.warna}99`,
                  }}
                >
                  {k.nama}
                </button>
              ))}
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border-2 border-red-100 bg-white p-5 text-center">
                <p className="font-bold text-warung-merah">{error}</p>
                <button
                  onClick={loadProduk}
                  className="mt-3 rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-5 py-2.5 font-extrabold text-warung-coklat active:border-b-0"
                >
                  Coba Lagi
                </button>
              </div>
            ) : loading ? (
              <p className="mt-10 text-center text-warung-coklat/60">Memuat...</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {tampil.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => tambah(p)}
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-amber-100 bg-white text-left shadow-sm transition active:scale-[0.99]"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-amber-50">
                      <FotoProduk
                        fotoUrl={p.fotoUrl}
                        nama={p.nama}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <span
                        className="inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: p.kategori?.warna }}
                      >
                        <span className="truncate">{p.kategori?.nama}</span>
                      </span>
                      <p className="mt-1 flex-1 break-words text-sm font-extrabold leading-tight text-warung-coklat">
                        {p.nama}
                      </p>
                      <div className="mt-1">
                        <StokBadge stok={p.stok} satuan={p.satuan} ukuran="xs" />
                      </div>
                      <p className="mt-1 font-extrabold text-warung-oranje">
                        {rupiah(p.harga)}
                      </p>
                    </div>
                  </button>
                ))}
                {tampil.length === 0 && (
                  <p className="col-span-full py-10 text-center text-warung-coklat/60">
                    Barang tidak ditemukan.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {!sukses && tab === "riwayat" && (
          <div className="space-y-3">
            {riwayatLoading ? (
              <p className="mt-10 text-center text-warung-coklat/60">Memuat...</p>
            ) : riwayat.length === 0 ? (
              <p className="rounded-2xl bg-white py-10 text-center text-warung-coklat/60">
                Belum ada pesanan di perangkat ini.
              </p>
            ) : (
              riwayat.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border-2 border-amber-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-base font-extrabold text-warung-coklat">
                        {t.noTransaksi}
                      </p>
                      <p className="text-xs text-warung-coklat/60">
                        {formatTanggalWaktu(t.tanggal)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        t.status === "Selesai"
                          ? "bg-green-100 text-warung-hijau"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.status === "Selesai" ? "Lunas" : "Menunggu Bayar"}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-0.5 text-sm text-warung-coklat/80">
                    {t.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-2">
                        <span className="min-w-0 truncate">
                          {it.qty} x {it.nama}
                        </span>
                        <span className="shrink-0 font-bold">
                          {rupiah(it.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 flex justify-between border-t border-dashed border-amber-200 pt-2 font-extrabold text-warung-coklat">
                    <span>Total</span>
                    <span className="text-warung-oranje">
                      {rupiah(t.grandTotal)}
                    </span>
                  </p>
                </div>
              ))
            )}

            <p className="rounded-xl bg-white px-4 py-3 text-center text-xs text-warung-coklat/60">
              Riwayat ini tersimpan di perangkat ini lewat cookie browser.
              Kalau cookie dihapus, riwayat tidak bisa dibuka lagi.
            </p>
          </div>
        )}
      </main>

      {cart.length > 0 && !sukses && tab === "menu" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-warung-kuningtua/40 bg-white p-3 shadow-2xl">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full rounded-xl border-b-4 border-green-700 bg-green-600 px-4 py-3.5 text-base font-extrabold text-white transition active:border-b-0"
          >
            Lihat Keranjang ({jumlahItem} item - {rupiah(total)})
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50">
          <div className="flex max-h-[90dvh] w-full flex-col rounded-t-3xl bg-warung-krem p-4">
            <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-amber-300" />
            <div className="flex shrink-0 items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-warung-coklat">
                Keranjang
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-xs font-bold text-warung-merah"
              >
                Tutup
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mt-3 space-y-2">
                {cartDetail.map((c) => (
                  <div
                    key={c.produkId}
                    className="rounded-xl border border-amber-100 bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 font-bold text-warung-coklat">
                        {c.nama}
                      </p>
                      <button
                        onClick={() => hapus(c.produkId)}
                        className="shrink-0 text-warung-merah"
                        title="Hapus"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => dec(c.produkId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-warung-krem font-extrabold text-warung-coklat"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-extrabold text-warung-coklat">
                          {c.qty}
                        </span>
                        <button
                          onClick={() => inc(c.produkId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-warung-kuning font-extrabold text-warung-coklat"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-warung-oranje">
                        {rupiah(c.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t-2 border-dashed border-amber-200 pt-3 text-sm">
                <p className="flex justify-between font-extrabold text-warung-coklat">
                  <span>Total</span>
                  <span className="text-warung-oranje">{rupiah(total)}</span>
                </p>
                <p className="mt-1 text-xs text-warung-coklat/60">
                  Pembayaran tunai tidak tersedia untuk pesanan online. Bayar di
                  toko dengan QRIS.
                </p>
              </div>
            </div>

            {cartError && (
              <p className="mt-2 shrink-0 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-warung-merah">
                {cartError}
              </p>
            )}

            <button
              onClick={kirim}
              disabled={sending}
              className="mt-3 w-full shrink-0 rounded-xl border-b-4 border-green-700 bg-green-600 px-4 py-4 text-lg font-extrabold text-white transition hover:bg-green-500 active:border-b-0 disabled:opacity-60"
            >
              {sending ? "Mengirim..." : "Kirim Pesanan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}