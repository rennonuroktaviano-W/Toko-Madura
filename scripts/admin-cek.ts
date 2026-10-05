import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { createAdapter, databaseUrlAsli, databaseTerpasang } from "../lib/adapter";
import { kodeSkema } from "../lib/api-error";

const prisma = new PrismaClient({ adapter: createAdapter() });

function garis(judul = "") {
  console.log("\n" + "=".repeat(58));
  if (judul) console.log(judul);
  console.log("=".repeat(58));
}

function ok(pesan) {
  console.log(`  [OK]   ${pesan}`);
}

function gagal(pesan) {
  console.log(`  [GAGAL] ${pesan}`);
}

function saran(pesan) {
  console.log(`  -> ${pesan}`);
}

function sembunyikanUrl(raw) {
  try {
    const url = new URL(raw);
    const user = url.username ? `${url.username}:***@` : "";
    return `${url.protocol}//${user}${url.hostname}:${url.port || 3306}${url.pathname}`;
  } catch {
    return "(tidak bisa di-parse)";
  }
}

async function periksa() {
  const masalah = [];

  garis("KONFIGURASI ENV");

  const raw = databaseUrlAsli();
  if (!raw) {
    gagal("DATABASE_URL kosong.");
    saran("Buat file .env di root project, isi DATABASE_URL.");
    masalah.push("DATABASE_URL kosong");
  } else {
    const url = databaseTerpasang();
    if (!url) {
      gagal("DATABASE_URL tidak bisa di-parse.");
      saran('Buang tanda kutip di sekitar nilainya, contoh: mysql://user:pass@localhost:3306/db');
      masalah.push("DATABASE_URL tidak valid");
    } else {
      ok(`DATABASE_URL terbaca: ${sembunyikanUrl(raw)}`);
      const hostname = url.hostname;
      if (
        process.env.NODE_ENV === "production" &&
        ["localhost", "127.0.0.1", "::1"].includes(hostname)
      ) {
        console.log(
          `  [INFO] Host database adalah "${hostname}".`
        );
        console.log(
          "         Kalau MariaDB untuk production ada di mesin/server lain,"
        );
        console.log("         ganti hostnya di .env, bukan pakai localhost.");
      }
    }
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    gagal("AUTH_SECRET kosong.");
    masalah.push("AUTH_SECRET kosong");
  } else if (secret === "warung-madura-dev-secret-change-me") {
    gagal("AUTH_SECRET masih nilai default dev.");
    masalah.push("AUTH_SECRET masih default");
  } else if (secret.length < 32) {
    gagal(`AUTH_SECRET cuma ${secret.length} karakter (minimal 32).`);
    masalah.push("AUTH_SECRET kependekan");
  } else {
    ok(`AUTH_SECRET aman (${secret.length} karakter).`);
  }

  if (masalah.length > 0) {
    return masalah;
  }

  garis("KONEKSI DATABASE");

  try {
    const mulai = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    ok(`Database menjawab dalam ${Date.now() - mulai}ms.`);
  } catch (err) {
    gagal(`Tidak bisa konek database (${err?.code ?? "tanpa-kode"}).`);
    if (/ER_ACCESS_DENIED/i.test(String(err?.message ?? ""))) {
      saran("User/password MariaDB salah. Cek user dan password di DATABASE_URL.");
    } else if (/ECONNREFUSED/i.test(String(err?.message ?? ""))) {
      saran("MariaDB belum jalan. Cek: systemctl status mariadb");
    } else if (/Unknown database/i.test(String(err?.message ?? ""))) {
      saran("Database belum dibuat. Cek: CREATE DATABASE toko_madura;");
    } else if (/self-signed|certificate|SSL|TLS/i.test(String(err?.message ?? ""))) {
      saran(
        "SSL ditolak. Kalau MariaDB lokal tanpa TLS, set DATABASE_SSL=false di .env"
      );
    }
    masalah.push("Koneksi database gagal");
    return masalah;
  }

  garis("SKEMA DATABASE");

  try {
    await prisma.user.count();
    ok("Tabel User ada.");
  } catch (err) {
    if (kodeSkema(err)) {
      gagal("Tabel User belum ada (migrasi belum di-deploy).");
      saran("Jalankan: npx prisma migrate deploy");
    } else {
      gagal(`Gagal membaca tabel User (${err?.code ?? "tanpa-kode"}).`);
      saran("Jalankan: npx prisma migrate deploy");
    }
    masalah.push("Migrasi belum di-deploy");
    return masalah;
  }

  garis("AKUN ADMIN");

  const argumen = process.argv.slice(2);
  const indeksUsername = argumen.findIndex(
    (a) => a === "--username" || a === "-u"
  );
  const adminUsername = (
    (indeksUsername !== -1 ? argumen[indeksUsername + 1] : undefined) ||
    process.env.ADMIN_USERNAME ||
    "admin"
  ).toLowerCase();
  try {
    const total = await prisma.user.count();
    ok(`Total user terdaftar: ${total}.`);
  } catch {
    // sudah dicek di atas
  }

  let admin = null;
  try {
    admin = await prisma.user.findUnique({
      where: { username: adminUsername },
    });
  } catch (err) {
    if (kodeSkema(err)) {
      gagal("Tabel User belum ada (migrasi belum di-deploy).");
      saran("Jalankan: npx prisma migrate deploy");
    } else {
      gagal(`Gagal membaca data user (${err?.code ?? "tanpa-kode"}).`);
    }
    masalah.push("Gagal membaca data user");
    return masalah;
  }

  if (!admin) {
    gagal(`User "${adminUsername}" tidak ada di database.`);
    saran(
      'Buat dulu: npm run admin:reset -- --password "PasswordKuatClient123"'
    );
    masalah.push(`User "${adminUsername}" belum ada`);
    return masalah;
  }

  ok(`User "${adminUsername}" ada (role: ${admin.role}).`);

  const indeksPassword = argumen.findIndex(
    (a) => a === "--password" || a === "-p"
  );
  const Password =
    indeksPassword !== -1
      ? argumen[indeksPassword + 1]
      : process.env.ADMIN_PASSWORD;

  if (!Password) {
    console.log(
      `\n  Untuk verifikasi password, jalankan:\n    npm run admin:cek -- --password "passwordnya"\n`
    );
    return masalah;
  }

  const cocok = await bcrypt.compare(Password, admin.password);
  if (cocok) {
    ok("Password yang dimasukkan COCOK dengan database.");
  } else {
    gagal("Password TIDAK cocok dengan yang tersimpan di database.");
    saran(
      `Set ulang dengan: npm run admin:reset -- --username ${adminUsername} --password "PasswordBaru"`
    );
    masalah.push("Password tidak cocok");
  }

  return masalah;
}

garis("CEK ADMIN - Toko Madura");

periksa()
  .then((masalah) => {
    garis("HASIL");
    if (masalah.length === 0) {
      console.log("  Semua siap. Login seharusnya berhasil.");
      console.log("");
    } else {
      console.log(`  Ada ${masalah.length} masalah:`);
      masalah.forEach((m, i) => console.log(`   ${i + 1}. ${m}`));
      console.log("");
    }
    return masalah.length;
  })
  .then((jumlah) => {
    process.exitCode = jumlah > 0 ? 1 : 0;
  })
  .catch((err) => {
    console.error("\n  Error tak terduga:", err?.message ?? err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });