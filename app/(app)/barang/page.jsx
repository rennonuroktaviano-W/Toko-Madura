"use client";

import { useCallback, useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

const SATUAN = ["pcs", "bungkus", "botol", "kaleng", "kg", "liter", "karung", "pack", "lembar"];

const emptyForm = {
  nama: "",
  kategoriId: "",
  harga: "",
  stok: "",
  satuan: "pcs",
  fotoUrl: "",
  status: "aktif",
};

export default function BarangPage() {
  const [produks, setProduks] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fKategori, setFKategori] = useState("semua");
  const [fStatus, setFStatus] = useState("semua");
  const [fQ, setFQ] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [restockId, setRestockId] = useState(null);
  const [restockJumlah, setRestockJumlah] = useState(5);
  const [restockLoading, setRestockLoading] = useState(false);

  const [msg, setMsg] = useState(null);

  function flash(text, type = "ok") {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }

  const loadData = useCallback(async () => {
    const params = new URLSearchParams();
    if (fKategori !== "semua") params.set("kategori", fKategori);
    if (fStatus !== "semua") params.set("status", fStatus);
    if (fQ.trim()) params.set("q", fQ.trim());
    try {
      const res = await fetch(`/api/produk?${params.toString()}`);
      if (!res.ok) throw new Error();
      setProduks(await res.json());
    } finally {
      setLoading(false);
    }
  }, [fKategori, fStatus, fQ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetch("/api/kategori")
      .then((r) => r.json())
      .then(setKategoris)
      .catch(() => {});
  }, []);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      nama: p.nama,
      kategoriId: String(p.kategoriId),
      harga: String(p.harga),
      stok: String(p.stok),
      satuan: p.satuan,
      fotoUrl: p.fotoUrl || "",
      status: p.status,
    });
    setOpenForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editId) {
        delete payload.stok;
      }
      const res = await fetch(editId ? `/api/produk/${editId}` : "/api/produk", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Gagal menyimpan", "error");
        return;
      }
      flash(editId ? "Barang diperbarui" : "Barang ditambahkan");
      setOpenForm(false);
      loadData();
    } catch {
      flash("Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Hapus barang "${p.nama}"?`)) return;
    try {
      const res = await fetch(`/api/produk/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Gagal menghapus", "error");
        return;
      }
      flash("Barang dihapus");
      loadData();
    } catch {
      flash("Terjadi kesalahan", "error");
    }
  }

  async function handleToggleStatus(p) {
    try {
      const next = p.status === "aktif" ? "nonaktif" : "aktif";
      const res = await fetch(`/api/produk/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        flash(data.error || "Gagal mengubah status", "error");
        return;
      }
      loadData();
    } catch {
      flash("Terjadi kesalahan", "error");
    }
  }

  async function handleRestock(e) {
    e.preventDefault();
    if (!restockId) return;
    setRestockLoading(true);
    try {
      const res = await fetch(`/api/produk/${restockId}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jumlah: Number(restockJumlah) }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Gagal restock", "error");
        return;
      }
      flash(`Stok ${data.nama} ditambah ${restockJumlah} ${data.satuan}`);
      setRestockId(null);
      loadData();
    } catch {
      flash("Terjadi kesalahan", "error");
    } finally {
      setRestockLoading(false);
    }
  }

  function StokBadge({ stok }) {
    if (stok <= 0)
      return (
        <span className="rounded-full bg-warung-merah px-2.5 py-1 text-xs font-extrabold text-white">
          HABIS
        </span>
      );
    if (stok <= 5)
      return (
        <span className="rounded-full bg-orange-200 px-2.5 py-1 text-xs font-extrabold text-orange-800">
          Sisa {stok} — Menipis!
        </span>
      );
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-warung-hijau">
        Stok {stok}
      </span>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-warung-coklat lg:text-3xl">
            Kelola Barang
          </h1>
          <p className="text-sm text-warung-coklat/60">
            Tambah, ubah, restock, dan atur stok barang dagangan.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-5 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
        >
          + Tambah Barang
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={fQ}
          onChange={(e) => setFQ(e.target.value)}
          placeholder="🔍 Cari nama barang..."
          className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-warung-oranye sm:max-w-xs"
        />
        <select
          value={fKategori}
          onChange={(e) => setFKategori(e.target.value)}
          className="rounded-xl border-2 border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-warung-oranye"
        >
          <option value="semua">Semua Kategori</option>
          {kategoris.map((k) => (
            <option key={k.id} value={k.id}>
              {k.icon} {k.nama}
            </option>
          ))}
        </select>
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
          className="rounded-xl border-2 border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-warung-oranye"
        >
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

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

      {loading ? (
        <p className="mt-10 text-center text-warung-coklat/60">Memuat...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {produks.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border-2 bg-white p-4 shadow-sm transition hover:shadow-md ${
                p.status === "nonaktif" ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-extrabold text-warung-coklat">
                    {p.nama}
                  </h3>
                  <span
                    className="mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: p.kategori.warna }}
                  >
                    {p.kategori.icon} {p.kategori.nama}
                  </span>
                </div>
                {p.status === "nonaktif" && (
                  <span className="shrink-0 rounded-full bg-gray-200 px-2 py-1 text-xs font-extrabold text-gray-600">
                    NONAKTIF
                  </span>
                )}
              </div>

              <p className="mt-3 text-xl font-extrabold text-warung-oranye">
                {rupiah(p.harga)}
                <span className="text-sm font-bold text-warung-coklat/50">
                  / {p.satuan}
                </span>
              </p>

              <div className="mt-2 flex items-center gap-2">
                <StokBadge stok={p.stok} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={openEdit.bind(null, p)}
                  className="rounded-lg bg-warung-krem px-3 py-2 text-sm font-bold text-warung-coklat transition hover:bg-amber-100"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setRestockId(p.id)}
                  className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-warung-hijau transition hover:bg-green-100"
                >
                  📦 Restock
                </button>
                <button
                  onClick={() => handleToggleStatus(p)}
                  className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
                >
                  {p.status === "aktif" ? "⏸ Nonaktifkan" : "▶️ Aktifkan"}
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-warung-merah transition hover:bg-red-100"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
          {produks.length === 0 && (
            <p className="col-span-full text-center text-warung-coklat/60">
              Tidak ada barang yang cocok.
            </p>
          )}
        </div>
      )}

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-xl font-extrabold text-warung-coklat">
              {editId ? "Edit Barang" : "Tambah Barang"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-warung-coklat">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="cth: Indomie Goreng"
                  className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-warung-coklat">
                    Kategori
                  </label>
                  <select
                    value={form.kategoriId}
                    onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}
                    className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye"
                    required
                  >
                    <option value="">Pilih...</option>
                    {kategoris.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.icon} {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-warung-coklat">
                    Satuan
                  </label>
                  <input
                    type="text"
                    list="satuan-list"
                    value={form.satuan}
                    onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                    className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye"
                  />
                  <datalist id="satuan-list">
                    {SATUAN.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-warung-coklat">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                    className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-warung-coklat">
                    {editId ? "Stok Saat Ini" : "Stok Awal"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    disabled={!!editId}
                    className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye disabled:opacity-50"
                    required={!editId}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-warung-coklat">
                  Foto URL (opsional)
                </label>
                <input
                  type="url"
                  value={form.fotoUrl}
                  onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="flex-1 rounded-xl bg-warung-krem px-4 py-3 font-bold text-warung-coklat transition hover:bg-amber-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {restockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-xl font-extrabold text-warung-coklat">
              📦 Restock Barang
            </h2>
            <form onSubmit={handleRestock} className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {[5, 10, 20, 50, 100].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRestockJumlah(n)}
                    className={`rounded-full px-4 py-2 font-bold transition ${
                      restockJumlah === n
                        ? "bg-warung-kuning text-warung-coklat ring-2 ring-warung-oranye"
                        : "bg-warung-krem text-warung-coklat hover:bg-amber-100"
                    }`}
                  >
                    +{n}
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-warung-coklat">
                  Jumlah Stok Ditambah
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockJumlah}
                  onChange={(e) => setRestockJumlah(e.target.value)}
                  className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 text-lg font-bold outline-none focus:border-warung-oranye"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockId(null)}
                  className="flex-1 rounded-xl bg-warung-krem px-4 py-3 font-bold text-warung-coklat transition hover:bg-amber-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={restockLoading}
                  className="flex-1 rounded-xl border-b-4 border-green-700 bg-green-600 px-4 py-3 font-extrabold text-white transition hover:bg-green-500 active:border-b-0 active:translate-y-0.5 disabled:opacity-60"
                >
                  {restockLoading ? "Menambah..." : "Tambah Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}