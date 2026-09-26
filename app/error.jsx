"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-warung-krem p-6 text-center">
      <h1 className="font-display text-2xl font-extrabold text-warung-coklat">
        Ada yang tidak beres
      </h1>
      <p className="max-w-md text-sm text-warung-coklat/70">
        Halaman ini gagal dimuat. Coba muat ulang. Kalau tetap sama, cek
        koneksi database dulu.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={reset}
          className="rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-5 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
        >
          Coba Lagi
        </button>
        <Link
          href="/kasir"
          className="rounded-xl bg-warung-krem px-5 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-100"
        >
          Ke Kasir
        </Link>
      </div>
    </div>
  );
}
