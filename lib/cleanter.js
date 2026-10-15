const BRIDGE = "http://localhost:9100";

export async function cekIzinLna() {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return "unsupported";
    }
    const hasil = await navigator.permissions.query({ name: "local-network-access" });
    return hasil.state;
  } catch {
    return "unsupported";
  }
}

export async function cleanterCek({ timeoutMs = 1500 } = {}) {
  if (typeof fetch !== "function") return null;
  try {
    const res = await fetch(`${BRIDGE}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function cetakCleanter(content, { paperWidth, cut = true, reference } = {}) {
  const izin = await cekIzinLna();
  const timeoutMs = izin === "prompt" ? 30000 : 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${BRIDGE}/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, paperWidth, cut, reference }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new Error(
        "Cleanter tidak merespons. Pastikan app Cleanter terbuka, printer sudah dipilih, dan server sedang jalan di HP ini."
      );
    }
    throw new Error(
      "Tidak bisa menghubungi Cleanter. Pastikan app Cleanter terbuka & servernya jalan di HP ini. Kalau baru pertama kali, izinkan \"Apps on device\" saat Chrome bertanya."
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail.fix || detail.detail || `Gagal cetak lewat Cleanter (${res.status}).`
    );
  }

  return res.json();
}
