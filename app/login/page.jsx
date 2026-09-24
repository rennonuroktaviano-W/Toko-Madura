"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal, coba lagi");
        return;
      }
      const next =
        new URLSearchParams(window.location.search).get("next") || "/dashboard";
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-amber-300 via-amber-200 to-orange-100 p-4">
      <div className="w-full max-w-sm rounded-3xl border-4 border-warung-coklat/20 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-warung-kuning bg-warung-krem text-4xl shadow-inner">
            🏪
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
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-warung-merah">
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