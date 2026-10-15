import { formatAngka, formatTanggalWaktu } from "./format";

const rp = formatAngka;

export function susunStrukBlok(transaksi, pengaturan, { lebar = 58 } = {}) {
  void lebar;
  const blok = [];
  const teks = (text, opsi = {}) => blok.push({ type: "text", text: String(text ?? ""), ...opsi });
  const baris = (left, right, opsi = {}) =>
    blok.push({ type: "row", left: String(left ?? ""), right: String(right ?? ""), ...opsi });
  const garis = () => blok.push({ type: "divider" });

  teks(pengaturan?.namaToko || "Warung Madura", {
    align: "center",
    bold: true,
  });
  if (pengaturan?.alamat) teks(pengaturan.alamat, { align: "center", size: "small" });
  if (pengaturan?.tagline) teks(pengaturan.tagline, { align: "center", bold: true, size: "small" });

  garis();
  teks(`No: ${transaksi.noTransaksi}`);
  teks(`Tgl: ${formatTanggalWaktu(transaksi.tanggal)}`);
  teks(`Kasir: ${transaksi.kasir?.nama || "-"}`);
  garis();

  for (const it of transaksi.items || []) {
    teks(it.nama, { bold: true });
    if (it.catatan) teks(it.catatan, { size: "small" });
    baris(`${it.qty} x @${rp(it.hargaSatuan)}`, rp(it.subtotal));
  }

  garis();
  baris("Jumlah item", `${transaksi.jumlahItem || 0} item`);
  baris("Subtotal", rp(transaksi.subtotal));
  baris("TOTAL", rp(transaksi.grandTotal), { bold: true });
  garis();
  baris(`Bayar (${transaksi.metodeBayar})`, rp(transaksi.jumlahBayar));
  if (transaksi.metodeBayar === "Tunai") {
    baris("Kembalian", rp(transaksi.kembalian));
  }

  garis();
  teks("~ Terima Kasih ~", { align: "center", bold: true });
  teks("Powered by Kasir Warung Madura", { align: "center", size: "small" });
  blok.push({ type: "feed", lines: 3 });

  return blok;
}
