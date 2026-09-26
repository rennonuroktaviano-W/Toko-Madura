const OFFSET = 7 * 60 * 60 * 1000;
const HARI_MS = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, "0");

const shifted = (date) => new Date(date.getTime() + OFFSET);

export function tanggalWIB(date = new Date()) {
  const d = shifted(date);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function hariWIB(date) {
  return shifted(date).getUTCDay();
}

export function tanggalValid(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const d = new Date(`${value}T00:00:00+07:00`);
  return !Number.isNaN(d.getTime()) && tanggalWIB(d) === value;
}

export function awalHariWIB(date = new Date()) {
  return new Date(`${tanggalWIB(date)}T00:00:00+07:00`);
}

export function rentangHariWIB(value) {
  const gte = new Date(`${value}T00:00:00+07:00`);
  return { gte, lt: new Date(gte.getTime() + HARI_MS) };
}

export function tambahHari(date, jumlah) {
  return new Date(date.getTime() + jumlah * HARI_MS);
}
