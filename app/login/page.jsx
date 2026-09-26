"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function tujuanSetelahLogin() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login")) {
    return next;
  }
  return "/kasir";
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [belumSiap, setBelumSiap] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBelumSiap(false);
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBelumSiap(Boolean(data.kode));
        setError(data.error || "Login gagal, coba lagi");
        return;
      }
      router.replace(tujuanSetelahLogin());
    } catch (err) {
      setError(
        err?.name === "AbortError"
          ? "Server tidak merespons dalam 15 detik. Periksa koneksi internet lalu coba lagi."
          : "Terjadi kesalahan, coba lagi."
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-amber-300 via-amber-200 to-orange-100 p-4">
      <div className="w-full max-w-sm rounded-3xl border-4 border-warung-coklat/20 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-warung-kuning bg-warung-krem shadow-inner">
            <span className="font-display text-3xl font-extrabold text-warung-oranye">
              WM
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-warung-coklat">
            Warung Madura
          </h1>
          <p className="mt-1 text-sm font-semibold text-warung-oranye">
            Kasir Kelontong 24 Jam
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-warung-coklat">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full rounded-xl border-2 border-warung-kuningtua/40 bg-warung-krem px-4 py-3 text-warung-coklat outline-none transition focus:border-warung-oranye focus:ring-2 focus:ring-warung-oranye/30"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-warung-coklat">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border-2 border-warung-kuningtua/40 bg-warung-krem px-4 py-3 text-warung-coklat outline-none transition focus:border-warung-oranye focus:ring-2 focus:ring-warung-oranye/30"
              required
            />
          </div>

          {error && (
            <div
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                belumSiap
                  ? "bg-amber-50 text-warung-coklat"
                  : "bg-red-50 text-warung-merah"
              }`}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-b-4 border-warung-kuningtua bg-warung-kuning px-4 py-3 text-lg font-extrabold text-warung-coklat transition hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-warung-coklat/60">
          Akun demo: <b>admin</b> / <b>admin123</b>
        </p>
      </div>
    </div>
  );
}