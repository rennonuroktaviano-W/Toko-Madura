"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StrukModal from "@/components/StrukModal";

export default function DetailTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const [transaksi, setTransaksi] = useState(null);
  const [pengaturan, setPengaturan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/transaksi/${params.id}`),
      fetch("/api/pengaturan"),
    ])
      .then(async ([a, b]) => {
        if (!a.ok) throw new Error("notfound");
        setTransaksi(await a.json());
        setPengaturan(await b.json());
      })
      .catch(() => setError("Transaksi tidak ditemukan."));
  }, [params.id]);

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