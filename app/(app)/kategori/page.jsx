"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/use-api";
import { useFlash } from "@/lib/use-flash";
import { MAX_NAMA } from "@/lib/validasi";

const WARNA = [
  "#dc2626",
  "#f97316",
  "#ea580c",
  "#f59e0b",
  "#eab308",
  "#16a34a",
  "#2563eb",
  "#db2777",
  "#7c3aed",
  "#78350f",
];

const emptyForm = { nama: "", warna: "#f59e0b" };

export default function KategoriPage() {
  const api = useApi();
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [msg, flash] = useFlash();

  const load = useCallback(async () => {
    try {
      setKategoris(await api.get("/api/kategori"));
    } catch (e) {
      flash(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [api, flash]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(k) {
    setEditId(k.id);
    setForm({ nama: k.nama, warna: k.warna });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/kategori/${editId}`, form);
      } else {
        await api.post("/api/kategori", form);
      }
      flash(editId ? "Kategori diperbarui" : "Kategori ditambahkan");
      setOpen(false);
      load();
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(k) {
    if (!window.confirm(`Hapus kategori "${k.nama}"?`)) return;
    try {
      await api.del(`/api/kategori/${k.id}`);
      flash("Kategori dihapus");
      load();
    } catch (err) {
      flash(err.message, "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-warung-coklat lg:text-3xl">
            Kategori Barang
          </h1>
          <p className="text-sm text-warung-coklat/60">
            Kelompokkan produk biar mudah dicari saat transaksi.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-5 py-3 font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5"
        >
          + Tambah Kategori
        </button>
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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kategoris.map((k) => (
            <div
              key={k.id}
              className="rounded-2xl border-2 bg-white p-5 shadow-sm transition hover:shadow-md"
              style={{ borderColor: k.warna }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 flex-none rounded-full shadow-inner"
                  style={{ backgroundColor: k.warna }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-extrabold text-warung-coklat">
                    {k.nama}
                  </h3>
                  <p className="text-xs font-semibold text-warung-coklat/50">
                    {k._count.produks} produk aktif
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(k)}
                  className="flex-1 rounded-lg bg-warung-krem px-3 py-2 text-sm font-bold text-warung-coklat transition hover:bg-amber-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(k)}
                  className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-warung-merah transition hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {kategoris.length === 0 && (
            <p className="col-span-full text-center text-warung-coklat/60">
              Belum ada kategori. Klik &quot;+ Tambah Kategori&quot; untuk mulai.
            </p>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-xl font-extrabold text-warung-coklat">
              {editId ? "Edit Kategori" : "Tambah Kategori"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-warung-coklat">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={form.nama}
                  maxLength={MAX_NAMA}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="cth: Jajanan Anak"
                  className="w-full rounded-xl border-2 border-amber-200 bg-warung-krem px-4 py-3 outline-none focus:border-warung-oranye"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-warung-coklat">
                  Warna Label
                </label>
                <div className="flex flex-wrap gap-2">
                  {WARNA.map((w) => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => setForm({ ...form, warna: w })}
                      className={`h-9 w-9 rounded-full transition ${
                        form.warna === w
                          ? "ring-4 ring-offset-2 ring-warung-oranye"
                          : ""
                      }`}
                      style={{ backgroundColor: w }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
    </div>
  );
}