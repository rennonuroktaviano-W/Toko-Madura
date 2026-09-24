export function rupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

export function formatTanggalWaktu(d) {
  const date = new Date(d);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}