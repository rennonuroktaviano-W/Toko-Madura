"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export class ApiError extends Error {
  constructor(message, status, kode) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kode = kode ?? null;
  }
}

const TIMEOUT_MS = 15000;

export function useApi() {
  const router = useRouter();

  const request = useCallback(
    async (path, { method = "GET", body } = {}) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      let res;
      try {
        res = await fetch(path, {
          method,
          headers:
            body === undefined ? undefined : { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
          cache: "no-store",
          signal: controller.signal,
        });
      } catch (e) {
        if (e?.name === "AbortError") {
          throw new ApiError(
            "Server tidak merespons dalam 15 detik. Periksa koneksi internet lalu coba lagi.",
            0
          );
        }
        throw new ApiError("Tidak bisa menghubungi server. Coba lagi.", 0);
      } finally {
        clearTimeout(timer);
      }

      if (res.status === 401) {
        router.replace("/login");
        throw new ApiError("Sesi berakhir, silakan masuk lagi.", 401);
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new ApiError(
          data?.error || "Terjadi kesalahan, coba lagi.",
          res.status,
          data?.kode ?? null
        );
      }
      return data;
    },
    [router]
  );

  return useMemo(
    () => ({
      get: (path) => request(path),
      post: (path, body) => request(path, { method: "POST", body }),
      put: (path, body) => request(path, { method: "PUT", body }),
      del: (path) => request(path, { method: "DELETE" }),
    }),
    [request]
  );
}
