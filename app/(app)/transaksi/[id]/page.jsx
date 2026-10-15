"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StrukModal from "@/components/StrukModal";
import { useApi } from "@/lib/use-api";

export default function DetailTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const [transaksi, setTransaksi] = useState(null);
  const [pengaturan, setPengaturan] = useState(null);
  const [error, setError] = useState("");
  const [lunasBusy, setLunasBusy] = useState(false);
  const [pesanLunas, setPesanLunas] = useState("");

  const load = useCallback(async () => {
    try {
      setTransaksi(await api.get(`/api/transaksi/${params.id}`));
      api.get("/api/pengaturan").then(setPengaturan).catch(() => {});
    } catch (e) {
      setError(
        e.status === 404
          ? "Transaksi tidak ditemukan."
          : e.message || "Gagal memuat transaksi."
      );
    }
  }, [api, params.id]);

  useEffect(() => {
    if (params.id) load();
  }, [load, params.id]);

  async function tandaiLunas() {
    if (lunasBusy) return;
    setLunasBusy(true);
    setPesanLunas("");
    try {
      const data = await api.patch(`/api/transaksi/${params.id}`, {
        aksi: "lunas",
      });
      setTransaksi(data.transaksi);
      setPesanLunas("Pesanan sudah ditandai lunas.");
    } catch (e) {
      setPesanLunas(e.message || "Gagal menandai lunas.");
    } finally {
      setLunasBusy(false);
    }
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="font-bold text-warung-coklat">{error}</p>
        <button
          onClick={() => router.push("/riwayat")}
          className="mt-4 rounded-xl bg-warung-kuning px-5 py-3 font-extrabold text-warung-coklat"
        >
          ← Kembali ke Riwayat
        </button>
      </div>
    );
  }

  if (!transaksi) {
    return (
      <div className="flex items-center justify-center py-32 text-warung-coklat/60">
        Memuat struk...
      </div>
    );
  }

  return (
    <StrukModal
      transaksi={transaksi}
      pengaturan={pengaturan}
      title="Detail Transaksi"
      buttonClose="← Kembali ke Riwayat"
      onClose={() => router.push("/riwayat")}
      footer={
        transaksi.status === "MenungguPembayaran" ? (
          <div className="mt-3">
            <button
              onClick={tandaiLunas}
              disabled={lunasBusy}
              className="w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-600 px-4 py-3 font-extrabold text-white transition hover:bg-emerald-500 active:border-b-0 active:translate-y-0.5 disabled:opacity-60"
            >
              {lunasBusy ? "Menyimpan..." : "Tandai Lunas"}
            </button>
            {pesanLunas && (
              <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-warung-coklat">
                {pesanLunas}
              </p>
            )}
          </div>
        ) : null
      }
    />
  );
}