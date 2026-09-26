export const MAX_NAMA = 191;
export const MAX_CATATAN = 191;

const WARNA_HEX = /^#[0-9a-fA-F]{6}$/;

export function warnaValid(value) {
  return WARNA_HEX.test(String(value ?? "").trim());
}

export function namaValid(value) {
  const nama = String(value ?? "").trim();
  return nama.length > 0 && nama.length <= MAX_NAMA;
}
