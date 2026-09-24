"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/kasir", label: "Kasir", icon: "🛒" },
  { href: "/barang", label: "Barang", icon: "🥫" },
  { href: "/kategori", label: "Kategori", icon: "🏷️" },
  { href: "/riwayat", label: "Riwayat", icon: "🧾" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
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
    router.refresh();
  }

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col bg-warung-hijau text-white">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <span className="text-3xl">🏪</span>
          <div>
            <p className="font-display text-xl font-extrabold leading-tight">
              Warung Madura
            </p>
            <p className="text-xs text-amber-200/80">Kasir 24 Jam</p>
          </div>
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
              <span className="text-xl">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl bg-red-600/80 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
          >
            <span className="text-xl">🚪</span> Keluar
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 bg-warung-hijau text-white shadow-lg lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-2xl">🏪</span>
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
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-full bg-red-600/80 px-4 py-2 text-sm font-bold text-white"
          >
            <span>🚪</span> Keluar
          </button>
        </nav>
      </header>
    </>
  );
}