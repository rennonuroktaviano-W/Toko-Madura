"use client";

export default function BelumSiap({ pesan, onCobaLagi }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-4 border-warung-kuningtua/30 bg-white p-10 text-center shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-warung-kuning bg-warung-krem">
        <span className="font-display text-2xl font-extrabold text-warung-oranye">!</span>
      </div>
      <div>
        <h2 className="font-display text-xl font-extrabold text-warung-coklat">
          Aplikasi belum siap dipakai
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-warung-coklat/70">
          {pesan ||
            "Data warung belum tersambung ke server. Hubungi admin untuk pengaturan."}
        </p>
      </div>
      {onCobaLagi && (
        <button
          onClick={onCobaLagi}
          className="rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-5 py-2 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
