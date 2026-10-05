import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { createAdapter } from "../lib/adapter";

const prisma = new PrismaClient({ adapter: createAdapter() });

function garis(judul = "") {
  console.log("\n" + "=".repeat(58));
  if (judul) console.log(judul);
  console.log("=".repeat(58));
}

function ambilArgumen(...kunci) {
  const argumen = process.argv.slice(2);
  for (const k of kunci) {
    const indeks = argumen.indexOf(k);
    if (indeks !== -1 && argumen[indeks + 1]) return argumen[indeks + 1];
  }
  return undefined;
}

async function tanyaPassword() {
  const dariArgumen = ambilArgumen("--password", "-p");
  if (dariArgumen) return dariArgumen;
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;

  const readline = await import("node:readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const jawaban = await rl.question("Password baru: ");
  const ulang = await rl.question("Ulangi password: ");
  rl.close();
  if (jawaban !== ulang) {
    console.error("\n  Password tidak sama. Batal.");
    process.exit(1);
  }
  return jawaban;
}

async function main() {
  const username = (
    ambilArgumen("--username", "-u") ||
    process.env.ADMIN_USERNAME ||
    "admin"
  )
    .trim()
    .toLowerCase();
  const nama = ambilArgumen("--name", "-n") || "Admin Warung";

  garis("SET ULUS ADMIN - Toko Madura");

  const password = await tanyaPassword();

  if (!password) {
    console.error("\n  Password tidak diberikan.");
    console.error("  Cara pakai:");
    console.error('    npm run admin:reset -- --password "PasswordBaru123"');
    console.error('    npm run admin:reset -- --username admin --password "PasswordBaru123"');
    console.error("  Password minimal 8 karakter.\n");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error(`\n  Password cuma ${password.length} karakter. Minimal 8.\n`);
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const ada = await prisma.user.findUnique({ where: { username } });

    if (ada) {
      await prisma.user.update({ where: { username }, data: { password: hash } });
      console.log(`\n  [OK]   Password user "${username}" berhasil diganti.`);
    } else {
      await prisma.user.create({
        data: { username, nama, password: hash, role: "admin" },
      });
      console.log(`\n  [OK]   User "${username}" dibuat dengan password baru.`);
    }

    console.log("\n  Silakan login dengan kredensial tersebut.\n");
  } catch (err) {
    console.error(`\n  Gagal menyimpan password (${err?.code ?? "tanpa-kode"}).`);
    console.error(`  ${err?.message ?? err}`);
    console.error("\n  Kalau errornya soal tabel/database, jalankan dulu:");
    console.error("    npm run admin:cek\n");
    process.exitCode = 1;
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});