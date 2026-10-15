"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/use-api";
import { useFlash } from "@/lib/use-flash";
import { MAX_NAMA } from "@/lib/validasi";
import BelumSiap from "@/components/BelumSiap";

const KOSONG = { namaToko: "", alamat: "", tagline: "" };

export default function PengaturanPage() {
  const api = useApi();
  const [form, setForm] = useState(KOSONG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [belumSiap, setBelumSiap] = useState(false);
  const [pesanBelumSiap, setPesanBelumSiap] = useState("");
  const [salin, setSalin] = useState("");
  const [msg, flash] = useFlash(2500);

  const urlPesan =
    typeof window === "undefined"
      ? "/pesan"
      : `${window.location.origin}/pesan`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/pengaturan");
      setForm({
        namaToko: data?.namaToko ?? "",
        alamat: data?.alamat ?? "",
        tagline: data?.tagline ?? "",
      });
      setBelumSiap(false);
    } catch (e) {
      if (e.kode) {
        setBelumSiap(true);
        setPesanBelumSiap(e.message);
      } else {
        flash(e.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [api, flash]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/pengaturan", form);
      flash("Pengaturan toko disimpan");
      load();
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function salinTeks(teks) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(teks);
        return true;
      } catch {}
    }

    try {
      const area = document.createElement("textarea");
      area.value = teks;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, area.value.length);
      const berhasil = document.execCommand("copy");
      document.body.removeChild(area);
      return berhasil;
    } catch {
      return false;
    }
  }

  async function salinLink() {
    const berhasil = await salinTeks(urlPesan);
    if (berhasil) {
      setSalin("Tersalin");
      setTimeout(() => setSalin(""), 2000);
    } else {
      flash("Tidak bisa menyalin otomatis. Salin manual dari kotak link.", "error");
    }
  }

  function linkMaps() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${form.namaToko} ${form.alamat}`.trim()
    )}`;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-warung-coklat lg:text-3xl">
        Pengaturan Toko
      </h1>
      <p className="text-sm text-warung-coklat/60">
        Nama toko dan lokasi dipakai di kasir, struk, dan halaman pemesanan
        pelanggan.
      </p>

      {msg && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
            msg.type === "error"
              ? "bg-red-50 text-warung-merah"
              : "bg-green-50 text-warung-hijau"
          }`}
        >
          {msg.text}
        </div>
      )}

      {belumSiap ? (
        <div className="mt-6">
          <BelumSiap pesan={pesanBelumSiap} onCobaLagi={load} />
        </div>
      ) : loading ? (
        <p className="mt-10 text-center text-warung-coklat/60">Memuat...</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border-2 border-amber-100 bg-white p-5 shadow-sm"
          >
            <div>
              <label className="mb-1 block text-sm font-bold text-warung-coklat">
                Nama Toko / Gerai
              </label>
              <input
                type="text"
                value={form.namaToko}
                maxLength={MAX_NAMA}
                onChange={(e) => setForm({ ...form, namaToko: e.target.value })}
                placeholder="cth: Warung Madura Barokah"
                className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranje"
                required
              />
              <p className="mt-1 text-xs text-warung-coklat/60">
                Tampil di menu kasir, struk, dan halaman pemesanan.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-warung-coklat">
                Alamat / Lokasi Toko
              </label>
              <textarea
                value={form.alamat}
                maxLength={MAX_NAMA}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                rows={2}
                placeholder="cth: Jl. Kenari No. 7, Pasar Anyar, Jakarta Selatan"
                className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranje"
              />
              {form.alamat.trim() && (
                <a
                  href={linkMaps()}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-1 inline-block text-xs font-bold text-warung-hijau hover:underline"
                >
                  Lihat di Google Maps →
                </a>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-warung-coklat">
                Tagline (opsional)
              </label>
              <input
                type="text"
                value={form.tagline}
                maxLength={MAX_NAMA}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="cth: Warung Kelontong 24 Jam"
                className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranje"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </form>

          <div className="space-y-4 rounded-2xl border-2 border-amber-100 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg font-extrabold text-warung-coklat">
                QR Pemesanan (Self Order)
              </h2>
              <p className="text-sm text-warung-coklat/60">
                Cetak dan tempel di meja/kasir. Pelanggan scan QR ini lalu pesan
                sendiri tanpa login.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl border-2 border-amber-200 bg-white p-3">
                <img
                  src="/api/pengaturan/qr"
                  alt="QR halaman pemesanan"
                  width={220}
                  height={220}
                  className="h-[220px] w-[220px]"
                />
              </div>

              <div className="w-full">
                <p className="mb-1 text-xs font-bold text-warung-coklat/60">
                  Link pemesanan
                </p>
                <input
                  readOnly
                  value={urlPesan}
                  onFocus={(e) => e.target.select()}
                  className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-2.5 text-sm font-bold text-warung-coklat outline-none"
                />
              </div>

              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={salinLink}
                  className="flex-1 rounded-xl bg-warung-krem px-4 py-2.5 text-sm font-bold text-warung-coklat transition hover:bg-amber-100"
                >
                  {salin || "Salin Link"}
                </button>
                <a
                  href="/pesan"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex-1 rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-2 text-center text-sm font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0"
                >
                  Buka Halaman
                </a>
              </div>

              <p className="text-center text-xs text-warung-coklat/60">
                QR dan link memakai alamat situs yang sedang dibuka. Sebelum
                dicetak, pastikan sudah dibuka dari domain production.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}