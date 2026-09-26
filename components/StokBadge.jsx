const UKURAN = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-1 text-xs",
};

export default function StokBadge({ stok, satuan = "", ukuran = "sm", penanda = "" }) {
  const pad = UKURAN[ukuran] ?? UKURAN.sm;

  if (stok <= 0) {
    return (
      <span className={`rounded-full bg-warung-merah ${pad} font-extrabold text-white`}>
        HABIS
      </span>
    );
  }

  if (stok <= 5) {
    return (
      <span className={`rounded-full bg-orange-200 ${pad} font-extrabold text-orange-800`}>
        {penanda ? `Sisa ${stok} — ${penanda}` : `Sisa ${stok}`}
      </span>
    );
  }

  return (
    <span className={`rounded-full bg-green-100 ${pad} font-bold text-warung-hijau`}>
      {satuan ? `${stok} ${satuan}` : `Stok ${stok}`}
    </span>
  );
}
