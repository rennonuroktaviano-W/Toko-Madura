"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Struk from "./Struk";
import { KERTAS, LEBAR_CETAK } from "@/lib/struk-teks";
import {
  bagikanPng,
  cetakBluetooth,
  cetakNative,
  cetakRawBt,
  cetakUsb,
  deteksiKemampuan,
  strukKeBytes,
  unduhPng,
} from "@/lib/print";

const RAWBT_PLAY_STORE =
  "https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter";

export default function StrukModal({
  transaksi,
  pengaturan,
  onClose,
  buttonClose = "Transaksi Baru",
  title = "Struk Transaksi",
}) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(null);
  const [lebar, setLebar] = useState(58);
  const [pesan, setPesan] = useState("");
  const [saranRawBt, setSaranRawBt] = useState(false);
  const [mampu, setMampu] = useState({
    usb: false,
    bluetooth: false,
    share: false,
    android: false,
  });

  useEffect(() => {
    setMampu(deteksiKemampuan());
  }, []);

  async function generatePng() {
    if (!ref.current) throw new Error("Struk belum siap.");
    return toPng(ref.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
  }

  async function jalankan(nama, fn) {
    if (busy) return;
    setBusy(nama);
    setPesan("");
    setSaranRawBt(false);
    try {
      await fn();
    } catch (e) {
      setPesan(e?.message || "Gagal mencetak. Coba cara lain.");
    } finally {
      setBusy(null);
    }
  }

  const cetakDialog = () => jalankan("dialog", () => cetakNative(lebar));

  const cetakUsbLangsung = () =>
    jalankan("usb", async () => {
      await cetakUsb(strukKeBytes(transaksi, pengaturan, lebar));
    });

  const cetakBluetoothLangsung = () =>
    jalankan("bt", async () => {
      await cetakBluetooth(strukKeBytes(transaksi, pengaturan, lebar));
    });

  const cetakLewatRawBt = () =>
    jalankan("rawbt", async () => {
      const terbuka = await cetakRawBt(strukKeBytes(transaksi, pengaturan, lebar));
      if (!terbuka) {
        setSaranRawBt(true);
        setPesan("RawBT sepertinya belum terpasang di HP ini.");
      }
    });

  const unduh = () =>
    jalankan("unduh", async () => {
      unduhPng(await generatePng(), transaksi.noTransaksi);
    });

  const bagikan = () =>
    jalankan("share", async () => {
      await bagikanPng(await generatePng(), transaksi.noTransaksi);
    });

  const tombolKelas =
    "rounded-xl border-b-4 px-4 py-3 text-sm font-extrabold transition active:border-b-0 active:translate-y-0.5 disabled:opacity-60";

  return (
    <div className="struk-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="struk-kartu my-6 w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl">
        <div className="no-print flex items-center justify-between">
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

        <div
          ref={ref}
          className="struk-cetak mt-3"
          style={{ "--lebar-struk": KERTAS[lebar].css }}
        >
          <Struk transaksi={transaksi} pengaturan={pengaturan} />
        </div>

        <div className="no-print mt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-warung-coklat">Lebar kertas</p>
            <div className="flex gap-1">
              {LEBAR_CETAK.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setLebar(k.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    lebar === k.id
                      ? "bg-warung-kuning text-warung-coklat ring-2 ring-warung-oranye"
                      : "bg-warung-krem text-warung-coklat hover:bg-amber-100"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <button
              onClick={cetakDialog}
              disabled={busy !== null}
              className={`${tombolKelas} border-blue-700 bg-blue-600 text-white hover:bg-blue-500`}
            >
              {busy === "dialog" ? "Membuka dialog..." : "Cetak / Simpan PDF"}
            </button>

            {mampu.usb && (
              <button
                onClick={cetakUsbLangsung}
                disabled={busy !== null}
                className={`${tombolKelas} border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-500`}
              >
                {busy === "usb" ? "Mencetak..." : "Printer Thermal USB"}
              </button>
            )}

            {mampu.bluetooth && (
              <button
                onClick={cetakBluetoothLangsung}
                disabled={busy !== null}
                className={`${tombolKelas} border-teal-700 bg-teal-600 text-white hover:bg-teal-500`}
              >
                {busy === "bt" ? "Mencetak..." : "Printer Thermal Bluetooth"}
              </button>
            )}

            {mampu.android && (
              <button
                onClick={cetakLewatRawBt}
                disabled={busy !== null}
                className={`${tombolKelas} border-indigo-700 bg-indigo-600 text-white hover:bg-indigo-500`}
              >
                {busy === "rawbt" ? "Mengirim ke RawBT..." : "Cetak via RawBT"}
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={unduh}
                disabled={busy !== null}
                className={`${tombolKelas} border-purple-700 bg-purple-600 text-white hover:bg-purple-500`}
              >
                {busy === "unduh" ? "Menyiapkan..." : "Download PNG"}
              </button>
              <button
                onClick={bagikan}
                disabled={busy !== null}
                className={`${tombolKelas} border-amber-700 bg-amber-600 text-white hover:bg-amber-500`}
              >
                {busy === "share" ? "Menyiapkan..." : "Bagikan"}
              </button>
            </div>
          </div>

          {pesan && (
            <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-warung-coklat">
              <p>{pesan}</p>
              {saranRawBt && (
                <a
                  href={RAWBT_PLAY_STORE}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-warung-oranye underline"
                >
                  Pasang RawBT dari Play Store →
                </a>
              )}
            </div>
          )}

          {mampu.android && !mampu.usb && !mampu.bluetooth && (
            <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-[11px] leading-snug font-semibold text-warung-coklat/70">
              <p>
                Di HP, cetak thermal pakai <b>RawBT</b>. Tombol <b>USB</b> &amp;{" "}
                <b>Bluetooth</b> langsung hanya tersedia di laptop (batasan browser HP).
              </p>
              <p className="mt-1">
                Belum bisa cetak? Pastikan printer sudah <b>di-pair</b> di Bluetooth HP
                lalu <b>dipilih</b> di app RawBT (Settings → Bluetooth printer).
              </p>
            </div>
          )}

          <p className="mt-3 text-[11px] leading-snug text-warung-coklat/60">
            Tips: kalau printer tidak muncul di &quot;Cetak / Simpan PDF&quot;,
            pakai Tombol USB/Bluetooth (browser akan meminta pilih printer), atau
            RawBT di Android, atau Download PNG lalu cetak dari app printer.
          </p>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
          >
            {buttonClose}
          </button>
        </div>
      </div>
    </div>
  );
}
