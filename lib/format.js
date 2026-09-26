export function formatAngka(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

export function rupiah(n) {
  return "Rp " + formatAngka(n);
}

export function formatRupiahSingkat(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000)
    return `Rp ${(v / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  if (v >= 1_000)
    return `Rp ${(v / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`;
  return `Rp ${v}`;
}

export function formatTanggalWaktu(d) {
  const date = new Date(d);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}
