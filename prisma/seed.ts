import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { createAdapter } from "../lib/adapter";

const prisma = new PrismaClient({ adapter: createAdapter() });

async function main() {
  await prisma.pengaturan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      namaToko: "Warung Madura Barokah",
      alamat: "Jl. Kenari No. 7, Pasar Anyar, Jakarta Selatan",
      tagline: "Warung Kelontong 24 Jam",
    },
  });

  const password = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { nama: "Admin Warung", password },
    create: {
      nama: "Admin Warung",
      username: "admin",
      password,
      role: "admin",
    },
  });

  const kategoriData = [
    { nama: "Rokok", warna: "#dc2626" },
    { nama: "Minuman Dingin", warna: "#2563eb" },
    { nama: "Jajanan Anak", warna: "#eab308" },
    { nama: "Sembako", warna: "#16a34a" },
    { nama: "Kebutuhan Harian", warna: "#ea580c" },
    { nama: "Es Krim", warna: "#db2777" },
  ];

  const kategoris: Record<string, number> = {};
  for (const k of kategoriData) {
    const saved = await prisma.kategori.upsert({
      where: { nama: k.nama },
      update: {},
      create: k,
    });
    kategoris[k.nama] = saved.id;
  }

  const produkData = [
    { nama: "Sampoerna Mild 12", kategori: "Rokok", harga: 28000, stok: 40, satuan: "bungkus" },
    { nama: "Gudang Garam Merah", kategori: "Rokok", harga: 26500, stok: 35, satuan: "bungkus" },
    { nama: "Djarum Super 16", kategori: "Rokok", harga: 30000, stok: 3, satuan: "bungkus" },
    { nama: "Aqua 600ml", kategori: "Minuman Dingin", harga: 4000, stok: 120, satuan: "botol" },
    { nama: "Coca-Cola 390ml", kategori: "Minuman Dingin", harga: 6000, stok: 0, satuan: "kaleng" },
    { nama: "Teh Botol Sosro 350ml", kategori: "Minuman Dingin", harga: 5000, stok: 60, satuan: "botol" },
    { nama: "Indomie Goreng", kategori: "Sembako", harga: 3500, stok: 200, satuan: "bungkus" },
    { nama: "Indomie Soto", kategori: "Sembako", harga: 3500, stok: 150, satuan: "bungkus" },
    { nama: "Beras Premium 5kg", kategori: "Sembako", harga: 70000, stok: 18, satuan: "karung" },
    { nama: "Minyak Goreng 1L", kategori: "Sembako", harga: 18000, stok: 4, satuan: "liter" },
    { nama: "Gula Pasir 1kg", kategori: "Sembako", harga: 17000, stok: 25, satuan: "kg" },
    { nama: "Telur Ayam 1kg", kategori: "Sembako", harga: 30000, stok: 20, satuan: "kg" },
    { nama: "Chitato 68g", kategori: "Jajanan Anak", harga: 12500, stok: 30, satuan: "pcs" },
    { nama: "Taro Netto 75g", kategori: "Jajanan Anak", harga: 11500, stok: 25, satuan: "pcs" },
    { nama: "Qtela Singkong 65g", kategori: "Jajanan Anak", harga: 10500, stok: 28, satuan: "pcs" },
    { nama: "Permen Kopiko", kategori: "Jajanan Anak", harga: 1500, stok: 5, satuan: "pcs" },
    { nama: "Roti Tawar Sari Roti", kategori: "Kebutuhan Harian", harga: 18000, stok: 12, satuan: "pcs" },
    { nama: "Sabun Lifebuoy Small", kategori: "Kebutuhan Harian", harga: 4000, stok: 40, satuan: "pcs" },
    { nama: "Sikat Gigi Pepsodent", kategori: "Kebutuhan Harian", harga: 8000, stok: 15, satuan: "pcs" },
    { nama: "Es Krim Aice", kategori: "Es Krim", harga: 6000, stok: 50, satuan: "pcs" },
    { nama: "Es Krim Magnum", kategori: "Es Krim", harga: 15000, stok: 8, satuan: "pcs" },
    { nama: "Es Krim Cornetto", kategori: "Es Krim", harga: 12000, stok: 2, satuan: "pcs" },
  ];

  const jumlahProduk = await prisma.produk.count();
  if (jumlahProduk === 0) {
    for (const p of produkData) {
      await prisma.produk.create({
        data: {
          nama: p.nama,
          kategoriId: kategoris[p.kategori],
          harga: p.harga,
          stok: p.stok,
          satuan: p.satuan,
          status: "aktif",
        },
      });
    }
  }

  console.log("Seed selesai: pengaturan, admin (admin/admin123), kategori & produk contoh.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });