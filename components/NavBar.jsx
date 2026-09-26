"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/kasir", label: "Kasir" },
  { href: "/barang", label: "Barang" },
  { href: "/kategori", label: "Kategori" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <>
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto bg-warung-hijau text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-display text-xl font-extrabold leading-tight">
            Warung Madura
          </p>
          <p className="text-xs text-amber-200/80">Kasir 24 Jam</p>
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
          <p className="font-display text-lg font-extrabold">Warung Madura</p>
          <span className="ml-auto font-bold text-amber-200 text-xs">
            Kasir 24 Jam
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