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
    />
  );
}