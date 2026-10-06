"use client";

export default function FotoProduk({ fotoUrl, nama, className = "" }) {
  if (!fotoUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-amber-50 text-2xl ${className}`}
        aria-hidden="true"
      >
        🛒
      </div>
    );
  }

  return (
    <img
      src={fotoUrl}
      alt={nama || "Foto produk"}
      loading="lazy"
      className={`object-cover ${className}`}
    />
  );
}