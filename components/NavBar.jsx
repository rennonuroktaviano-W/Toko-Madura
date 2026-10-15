"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/kasir", label: "Kasir" },
  { href: "/barang", label: "Barang" },
  { href: "/kategori", label: "Kategori" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pengaturan", label: "Pengaturan" },
];

const DEFAULT = { namaToko: "Warung Madura", tagline: "Kasir 24 Jam" };

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [toko, setToko] = useState(DEFAULT);

  useEffect(() => {
    let batal = false;
    fetch("/api/pengaturan", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (batal || !data) return;
        setToko({
          namaToko: data.namaToko || DEFAULT.namaToko,
          tagline: data.tagline || DEFAULT.tagline,
        });
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [pathname]);

  function isActive(href) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    router.replace("/login");
  }

  return (
    <>
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto bg-warung-hijau text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-display text-xl font-extrabold leading-tight">
            {toko.namaToko}
          </p>
          <p className="text-xs text-amber-200/80">{toko.tagline}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                isActive(l.href)
                  ? "bg-warung-kuning text-warung-coklat shadow"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl bg-red-600/80 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
          >
            Keluar
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 bg-warung-hijau text-white shadow-lg lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <p className="font-display text-lg font-extrabold">{toko.namaToko}</p>
          <span className="ml-auto font-bold text-amber-200 text-xs">
            {toko.tagline}
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                isActive(l.href)
                  ? "bg-warung-kuning text-warung-coklat"
                  : "bg-white/10 text-white/90"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-full bg-red-600/80 px-4 py-2 text-sm font-bold text-white"
          >
            Keluar
          </button>
        </nav>
      </header>
    </>
  );
}
