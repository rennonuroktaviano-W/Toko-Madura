export const MAX_NAMA = 191;
export const MAX_CATATAN = 191;

const WARNA_HEX = /^#[0-9a-fA-F]{6}$/;

export const MIME_FOTO = ["image/jpeg", "image/png", "image/webp"];

export const MAX_BYTES_FOTO = 2 * 1024 * 1024;

export function warnaValid(value) {
  return WARNA_HEX.test(String(value ?? "").trim());
}

export function namaValid(value) {
  const nama = String(value ?? "").trim();
  return nama.length > 0 && nama.length <= MAX_NAMA;
}

export function fotoUrlValid(value) {
  const url = String(value ?? "").trim();
  if (!url || url.length > MAX_NAMA) return false;
  if (url.startsWith("/api/foto/")) return true;
  return /^https:\/\/\S+$/i.test(url);
}

export function idFotoDariUrl(value) {
  const url = String(value ?? "").trim();
  return url.startsWith("/api/foto/") ? url.slice("/api/foto/".length) : null;
}
