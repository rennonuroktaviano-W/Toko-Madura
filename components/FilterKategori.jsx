const SEMUA = { id: "semua", nama: "Semua" };

export default function FilterKategori({ kategoris = [], aktif, onPilih, varian = "chip" }) {
  const sidebar = varian === "sidebar";

  const gaya = (terpilih) =>
    sidebar
      ? `mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
          terpilih
            ? "bg-warung-kuning text-warung-coklat"
            : "text-warung-coklat hover:bg-warung-krem"
        }`
      : `shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
          terpilih
            ? "bg-warung-kuning text-warung-coklat"
            : "bg-white text-warung-coklat"
        }`;

  return (
    <>
      {[SEMUA, ...kategoris].map((k) => {
        const terpilih = String(aktif) === String(k.id);
        return (
          <button
            key={k.id}
            type="button"
            onClick={() => onPilih(k.id)}
            aria-pressed={terpilih}
            className={gaya(terpilih)}
          >
            {sidebar ? <span className="truncate">{k.nama}</span> : k.nama}
          </button>
        );
      })}
    </>
  );
}
