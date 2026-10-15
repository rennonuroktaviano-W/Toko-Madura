import { formatAngka, formatTanggalWaktu } from "./format";

export const KERTAS = {
  58: { mm: 58, css: "50mm", kolom: 32 },
  80: { mm: 80, css: "72mm", kolom: 48 },
};

export const LEBAR_CETAK = [
  { id: 58, label: "58mm" },
  { id: 80, label: "80mm" },
];

function tengah(teks, kolom) {
  const t = String(teks ?? "");
  if (t.length >= kolom) return t.slice(0, kolom);
  const kiri = Math.floor((kolom - t.length) / 2);
  return " ".repeat(kiri) + t;
}

function duaKolom(kiri, kanan, kolom) {
  const k = String(kiri ?? "");
  const n = String(kanan ?? "");
  const sisa = kolom - n.length - 1;
  const kiriPotong = k.length > Math.max(0, sisa) ? k.slice(0, Math.max(0, sisa)) : k;
  const spasi = Math.max(1, kolom - kiriPotong.length - n.length);
  return kiriPotong + " ".repeat(spasi) + n;
}

export function susunStruk(transaksi, pengaturan, { lebar = 58 } = {}) {
  const kolom = KERTAS[lebar]?.kolom ?? 32;
  const rp = (n) => "Rp" + formatAngka(n);
  const garis = "-".repeat(kolom);
  const baris = [];

  baris.push(tengah(pengaturan?.namaToko || "Warung Madura", kolom));
  if (pengaturan?.alamat) baris.push(tengah(pengaturan.alamat, kolom));
  if (pengaturan?.tagline) baris.push(tengah(pengaturan.tagline, kolom));

  baris.push(garis);
  baris.push(`No : ${transaksi.noTransaksi}`);
  baris.push(`Tgl: ${formatTanggalWaktu(transaksi.tanggal)}`);
  baris.push(`Kasir: ${transaksi.kasir?.nama || "-"}`);
  baris.push(garis);

  for (const it of transaksi.items || []) {
    baris.push(it.nama);
    if (it.catatan) baris.push(`  ${it.catatan}`);
    baris.push(duaKolom(`  ${it.qty} x ${rp(it.hargaSatuan)}`, rp(it.subtotal), kolom));
  }

  baris.push(garis);
  baris.push(duaKolom("Jumlah item", `${transaksi.jumlahItem || 0} item`, kolom));
  baris.push(duaKolom("Subtotal", rp(transaksi.subtotal), kolom));
  baris.push(duaKolom("TOTAL", rp(transaksi.grandTotal), kolom));
  baris.push(garis);

  baris.push(duaKolom(`Bayar (${transaksi.metodeBayar})`, rp(transaksi.jumlahBayar), kolom));
  if (transaksi.metodeBayar === "Tunai") {
    baris.push(duaKolom("Kembalian", rp(transaksi.kembalian), kolom));
  }

  baris.push(garis);
  baris.push(tengah("~ Terima Kasih ~", kolom));
  baris.push(tengah("Powered by Kasir Warung Madura", kolom));

  return baris;
}

export function strukKeTeks(transaksi, pengaturan, opts) {
  return susunStruk(transaksi, pengaturan, opts).join("\n");
}
