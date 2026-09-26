"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { rupiah } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useFlash } from "@/lib/use-flash";
import { MAX_CATATAN } from "@/lib/validasi";
import FilterKategori from "@/components/FilterKategori";
import StokBadge from "@/components/StokBadge";
import StrukModal from "@/components/StrukModal";

function CartPanel({
  cart,
  total,
  jumlahItem,
  metode,
  setMetode,
  bayar,
  setBayar,
  kembalian,
  inc,
  dec,
  removeItem,
  toggleCatatan,
  setCatatan,
  hapusSemua,
  onSubmit,
  onPerbesarQR,
  processing,
  error,
  setError,
}) {
  return (
    <div className="flex max-h-[calc(90dvh-8rem)] flex-col rounded-2xl border-2 border-warung-kuningtua/30 bg-white p-4 shadow-sm lg:max-h-[calc(100dvh-7rem)]">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-warung-coklat">
          Keranjang
        </h2>
        {cart.length > 0 && (
          <button
            onClick={hapusSemua}
            className="text-xs font-bold text-warung-merah hover:underline"
          >
            Kosongkan
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="mt-4 rounded-xl bg-warung-krem px-4 py-6 text-center text-sm text-warung-coklat/60">
            Belum ada barang. Klik produk untuk menambah.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {cart.map((c) => (
              <div key={c.produkId} className="rounded-xl border border-amber-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 font-bold text-warung-coklat">{c.nama}</p>
                  <button
                    onClick={() => removeItem(c.produkId)}
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
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-warung-krem font-extrabold text-warung-coklat transition hover:bg-amber-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-extrabold text-warung-coklat">
                      {c.qty}
                    </span>
                    <button
                      onClick={() => inc(c.produkId)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-warung-kuning font-extrabold text-warung-coklat transition hover:bg-amber-400"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-warung-oranye">{rupiah(c.subtotal)}</p>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-warung-coklat/50">
                    {c.qty} x {rupiah(c.harga)} / {c.satuan}
                  </p>
                  <button
                    onClick={() => toggleCatatan(c.produkId)}
                    className="text-xs font-bold text-warung-hijau hover:underline"
                  >
                    {c.showCatatan ? "Tutup" : c.catatan ? "Ubah Catatan" : "Catatan"}
                  </button>
                </div>
                {c.showCatatan && (
                  <input
                    type="text"
                    value={c.catatan}
                    maxLength={MAX_CATATAN}
                    onChange={(e) => setCatatan(c.produkId, e.target.value)}
                    placeholder="Catatan (mis. No Gula)"
                    className="mt-2 w-full rounded-lg border-2 border-amber-200 bg-warung-krem px-3 py-2 text-sm outline-none focus:border-warung-oranje"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <>
            <div className="mt-4 border-t-2 border-dashed border-amber-200 pt-3 text-sm">
              <p className="flex justify-between font-semibold text-warung-coklat/70">
                <span>Jumlah item</span>
                <span>{jumlahItem} item</span>
              </p>
              <p className="mt-1 flex justify-between text-lg font-extrabold text-warung-coklat">
                <span>Total</span>
                <span className="text-warung-oranye">{rupiah(total)}</span>
              </p>
            </div>

            <div className="mt-3">
              <p className="mb-1 text-sm font-bold text-warung-coklat">
                Metode Bayar
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMetode("Tunai");
                    setError("");
                  }}
                  className={`rounded-xl px-3 py-2.5 font-extrabold transition ${
                    metode === "Tunai"
                      ? "bg-warung-kuning text-warung-coklat ring-2 ring-warung-oranye"
                      : "bg-warung-krem text-warung-coklat hover:bg-amber-100"
                  }`}
                >
                  Tunai
                </button>
                <button
                  onClick={() => {
                    setMetode("QRIS");
                    setError("");
                    onPerbesarQR();
                  }}
                  className={`rounded-xl px-3 py-2.5 font-extrabold transition ${
                    metode === "QRIS"
                      ? "bg-warung-kuning text-warung-coklat ring-2 ring-warung-oranye"
                      : "bg-warung-krem text-warung-coklat hover:bg-amber-100"
                  }`}
                >
                  QRIS
                </button>
              </div>
            </div>

            {metode === "Tunai" && (
              <div className="mt-3">
                <label className="mb-1 block text-sm font-bold text-warung-coklat">
                  Nominal Bayar
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={bayar}
                  onChange={(e) => setBayar(e.target.value)}
                  placeholder="Masukkan nominal"
                  className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 text-lg font-extrabold outline-none focus:border-warung-oranye"
                />
                {Number(bayar) > 0 && (
                  <p className="mt-2 flex justify-between text-sm font-bold text-warung-hijau">
                    <span>Kembalian</span>
                    <span>{rupiah(kembalian)}</span>
                  </p>
                )}
              </div>
            )}

            {metode === "QRIS" && (
              <div className="mt-3 rounded-xl border-2 border-blue-100 bg-blue-50 p-3 text-center">
                <button
                  type="button"
                  onClick={onPerbesarQR}
                  title="Perbesar QR"
                  className="mx-auto block w-full max-w-[200px] rounded-lg bg-white p-1 transition hover:bg-blue-100"
                >
                  <Image
                    src="/qris.png"
                    alt="QRIS"
                    width={752}
                    height={752}
                    unoptimized
                    className="h-auto w-full object-contain"
                  />
                </button>
                <p className="mt-2 text-[11px] font-semibold leading-snug text-blue-800">
                  Minta pelanggan scan QR ini, lalu masukkan nominal {rupiah(total)}.
                  Ketuk QR untuk memperbesar.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="shrink-0">
          {error && (
            <div className="mb-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-warung-merah">
              {error}
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={processing || cart.length === 0}
            className="w-full rounded-xl border-b-4 border-green-700 bg-green-600 px-4 py-4 text-lg font-extrabold text-white transition hover:bg-green-500 active:border-b-0 active:translate-y-0.5 disabled:opacity-50"
          >
            {processing ? "Memproses..." : "Selesaikan Transaksi"}
          </button>
        </div>
      )}
    </div>
  );
}

function QrisZoom({ onTutup }) {
  return (
    <div
      onClick={onTutup}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-6"
    >
      <Image
        src="/qris.png"
        alt="QRIS"
        width={752}
        height={752}
        unoptimized
        className="max-h-[68vh] w-auto max-w-full rounded-2xl bg-white p-3"
      />
      <p className="max-w-sm text-center text-sm font-bold text-white">
        Minta pelanggan scan QR ini. Ketuk layar untuk menutup.
      </p>
    </div>
  );
}

export default function KasirPage() {
  const api = useApi();
  const [produks, setProduks] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [pengaturan, setPengaturan] = useState(null);
  const [kategoriAktif, setKategoriAktif] = useState("semua");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [metode, setMetode] = useState("Tunai");
  const [bayar, setBayar] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [struk, setStruk] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [qrisZoom, setQrisZoom] = useState(false);
  const [flash, flashMsg] = useFlash(2500);

  const loadProduk = useCallback(async () => {
    setProduks(await api.get("/api/produk?status=aktif"));
  }, [api]);

  useEffect(() => {
    loadProduk().catch(() => {});
    api.get("/api/kategori").then(setKategoris).catch(() => {});
    api.get("/api/pengaturan").then(setPengaturan).catch(() => {});
  }, [api, loadProduk]);

  const filtered = useMemo(() => {
    let list = produks;
    if (kategoriAktif !== "semua") {
      list = list.filter((p) => String(p.kategoriId) === String(kategoriAktif));
    }
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((p) => p.nama.toLowerCase().includes(t));
    }
    return list;
  }, [produks, kategoriAktif, q]);

  const cartDetail = cart.map((c) => ({ ...c, subtotal: c.harga * c.qty }));
  const total = cartDetail.reduce((s, i) => s + i.subtotal, 0);
  const jumlahItem = cart.reduce((s, i) => s + i.qty, 0);
  const nominalBayar = Number(bayar);
  const kembalian = metode === "Tunai" && nominalBayar > 0 ? nominalBayar - total : 0;
  const uangKurang = metode === "Tunai" && nominalBayar > 0 && nominalBayar < total;

  function addToCart(p) {
    const found = cart.find((c) => c.produkId === p.id);
    if (found) {
      if (found.qty >= p.stok) {
        flashMsg(`Stok ${p.nama} hanya tersisa ${p.stok}`);
        return;
      }
      setCart((prev) =>
        prev.map((c) => (c.produkId === p.id ? { ...c, qty: c.qty + 1 } : c))
      );
      return;
    }
    if (p.stok <= 0) {
      flashMsg(`${p.nama} sudah habis`);
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
        catatan: "",
        showCatatan: false,
      },
    ]);
  }

  function inc(produkId) {
    const item = cart.find((c) => c.produkId === produkId);
    if (item && item.qty >= item.stok) {
      flashMsg(`Stok ${item.nama} hanya tersisa ${item.stok}`);
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.produkId === produkId ? { ...c, qty: c.qty + 1 } : c
      )
    );
  }

  function dec(produkId) {
    setCart((prev) =>
      prev.map((c) =>
        c.produkId === produkId && c.qty > 1 ? { ...c, qty: c.qty - 1 } : c
      )
    );
  }

  function removeItem(produkId) {
    setCart((prev) => prev.filter((c) => c.produkId !== produkId));
  }

  function hapusSemua() {
    setCart([]);
  }

  function toggleCatatan(produkId) {
    setCart((prev) =>
      prev.map((c) =>
        c.produkId === produkId ? { ...c, showCatatan: !c.showCatatan } : c
      )
    );
  }

  function setCatatan(produkId, val) {
    setCart((prev) =>
      prev.map((c) =>
        c.produkId === produkId ? { ...c, catatan: val } : c
      )
    );
  }

  async function selesaikan() {
    setError("");
    if (cart.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }
    if (metode === "Tunai") {
      if (!bayar) {
        setError("Masukkan nominal bayar.");
        return;
      }
      if (uangKurang) {
        setError(`Uang kurang ${rupiah(total - nominalBayar)}.`);
        return;
      }
    }
    setProcessing(true);
    try {
      const data = await api.post("/api/transaksi", {
        items: cart.map((c) => ({
          produkId: c.produkId,
          qty: c.qty,
          catatan: c.catatan || undefined,
        })),
        metodeBayar: metode,
        jumlahBayar: metode === "Tunai" ? nominalBayar : total,
      });
      setStruk(data.transaksi);
      setCart([]);
      setBayar("");
      setMetode("Tunai");
      setCartOpen(false);
      loadProduk().catch(() => {});
    } catch (e) {
      setError(e.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="pb-28 lg:pb-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-extrabold text-warung-coklat lg:text-3xl">
          Halaman Kasir
        </h1>
        {flash && (
          <span className="max-w-full truncate rounded-full bg-warung-kuning px-4 py-2 text-sm font-extrabold text-warung-coklat shadow">
            {flash.text}
          </span>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)_280px] lg:items-start lg:gap-4">
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <div className="rounded-2xl border-2 border-warung-kuningtua/30 bg-white p-3 shadow-sm">
            <FilterKategori
              kategoris={kategoris}
              aktif={kategoriAktif}
              onPilih={setKategoriAktif}
              varian="sidebar"
            />
          </div>
        </aside>

        <section>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari barang (cth: Indomie)..."
            className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-warung-oranye lg:sticky lg:top-24 lg:z-10"
          />

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <FilterKategori
              kategoris={kategoris}
              aktif={kategoriAktif}
              onPilih={setKategoriAktif}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stok <= 0}
                className="group flex min-w-0 flex-col rounded-2xl border-2 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                style={{ borderColor: p.kategori.warna + "55" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-1">
                  <span
                    className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: p.kategori.warna }}
                  >
                    <span className="truncate">{p.kategori.nama}</span>
                  </span>
                  <StokBadge stok={p.stok} satuan={p.satuan} ukuran="xs" />
                </div>
                <p className="mt-2 flex-1 break-words text-sm font-extrabold leading-tight text-warung-coklat">
                  {p.nama}
                </p>
                <p className="mt-auto flex-wrap break-words font-extrabold text-warung-oranye">
                  {rupiah(p.harga)}
                  <span className="text-[11px] font-bold text-warung-coklat/50">
                    /{p.satuan}
                  </span>
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-warung-coklat/60">
                Tidak ada produk ditemukan.
              </p>
            )}
          </div>
        </section>

        <aside className="hidden lg:block lg:sticky lg:top-24">
          <CartPanel
            cart={cartDetail}
            total={total}
            jumlahItem={jumlahItem}
            metode={metode}
            setMetode={setMetode}
            bayar={bayar}
            setBayar={setBayar}
            kembalian={kembalian}
            inc={inc}
            dec={dec}
            removeItem={removeItem}
            toggleCatatan={toggleCatatan}
            setCatatan={setCatatan}
            hapusSemua={hapusSemua}
            onSubmit={selesaikan}
            onPerbesarQR={() => setQrisZoom(true)}
            processing={processing}
            error={error}
            setError={setError}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-warung-kuningtua/40 bg-white p-3 shadow-2xl lg:hidden">
        <button
          onClick={() => setCartOpen(true)}
          className="w-full rounded-xl border-b-4 border-green-700 bg-green-600 px-4 py-4 text-lg font-extrabold text-white transition active:border-b-0 active:translate-y-0.5"
        >
          Lihat Keranjang ({jumlahItem} item — {rupiah(total)})
        </button>
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 lg:hidden">
          <div className="flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-3xl bg-warung-krem p-4">
            <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-amber-300" />
            <CartPanel
              cart={cartDetail}
              total={total}
              jumlahItem={jumlahItem}
              metode={metode}
              setMetode={setMetode}
              bayar={bayar}
              setBayar={setBayar}
              kembalian={kembalian}
              inc={inc}
              dec={dec}
              removeItem={removeItem}
              toggleCatatan={toggleCatatan}
              setCatatan={setCatatan}
              hapusSemua={hapusSemua}
              onSubmit={selesaikan}
              onPerbesarQR={() => setQrisZoom(true)}
              processing={processing}
              error={error}
              setError={setError}
            />
            <button
              onClick={() => setCartOpen(false)}
              className="mt-3 w-full shrink-0 rounded-xl bg-warung-krem px-4 py-3 font-bold text-warung-coklat"
            >
              Tutup Keranjang
            </button>
          </div>
        </div>
      )}

      {qrisZoom && <QrisZoom onTutup={() => setQrisZoom(false)} />}

      {struk && (
        <StrukModal
          transaksi={struk}
          pengaturan={pengaturan}
          onClose={() => setStruk(null)}
        />
      )}
    </div>
  );
}
