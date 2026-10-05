# Toko Madura App

Aplikasi kasir sederhana untuk Toko Madura dengan fitur manajemen produk, kategori, transaksi, dan riwayat penjualan.

## Teknologi

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Prisma ORM](https://www.prisma.io/) dengan adapter MariaDB
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) untuk hashing password
- [jose](https://github.com/panva/jose) untuk JWT session
- [Tailwind CSS v4](https://tailwindcss.com/)

## Persyaratan

- Node.js >= 20
- MariaDB/MySQL 5.7+ atau 8.x
- npm atau pnpm

## Setup Lokal

1. Clone repository
```bash
git clone <repo-url>
cd toko-madura-app
```

2. Install dependencies
```bash
npm install
```

3. Salin file environment
```bash
cp .env.example .env
```

4. Konfigurasi `.env`
```env
DATABASE_URL="mysql://user:password@localhost:3306/toko_madura"
AUTH_SECRET="ganti-dengan-random-string-minimal-32-karakter"
COOKIE_SECURE="false" # set true hanya jika akses via HTTPS
NODE_ENV="development"
```

5. Generate Prisma Client
```bash
npx prisma generate
```

6. Migrasi database
```bash
npx prisma migrate deploy
```

7. Seed data (opsional, membuat admin dengan password default)
```bash
npm run db:seed
```

8. Pastikan semuanya siap
```bash
npm run admin:cek -- --password "admin123"
```

9. Jalankan development server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Akun Admin

Setelah seed, user `admin` dibuat dengan password default `admin123`.

**Ganti password sebelum dipakai client:**
```bash
npm run admin:reset -- --password "PasswordKuatClient123"
```

> `npm run db:seed` **tidak** lagi mengubah password admin yang sudah ada. Seed hanya membuat akun admin kalau belum ada, jadi aman dijalankan ulang di production.

## Deployment

### Vercel
- Build command: `prisma generate && next build`
- Install command: `npm install`
- Set environment variables di Vercel:
  - `DATABASE_URL` (MySQL/MariaDB)
  - `AUTH_SECRET` (minimal 32 karakter, random)
  - `COOKIE_SECURE` (opsional, default `true` di production. Set `false` jika testing via HTTP tanpa HTTPS)
  - `NODE_ENV` (production)

### VPS (Ubuntu/Debian) + PM2

1. Install dan clone
```bash
git clone <repo-url>
cd Toko-Madura
npm install
```

2. Buat `.env` di root project

`.env` tidak ikut git, jadi wajib dibuat manual di VPS.

```bash
# Generate secret
openssl rand -hex 32
```

```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/toko_madura"
AUTH_SECRET="hasil-openssl-rand-hex-32"
COOKIE_SECURE="false"
NODE_ENV="production"
```

`COOKIE_SECURE`:
- `false` kalau diakses lewat `http://IP:3010`
- `true` kalau diakses lewat `https://domain` (reverse proxy + SSL)

3. Siapkan database
```bash
npx prisma generate
npx prisma migrate deploy
```

4. Cek kondisi (read-only, aman dijalankan kapan saja)
```bash
npm run admin:cek
```

Kalau muncul `[GAGAL] User "admin" belum ada`, buat dulu:
```bash
npm run db:seed
```

Atau set password sendiri tanpa seed:
```bash
npm run admin:reset -- --password "PasswordKuatClient123"
```

5. Build
```bash
npm run build
```

Build production akan gagal dengan pesan jelas kalau `AUTH_SECRET` kosong atau kurang dari 32 karakter.

6. Jalankan dengan PM2
```bash
pm2 start npm --name toko-madura -- start -- -p 3010
pm2 save
pm2 startup
```

7. Verifikasi
```bash
curl -s http://127.0.0.1:3010/api/health
```

Semua field harus `true` / `ok: true`, termasuk `admin_ada`.

## Troubleshooting: Situs Terbuka Tapi Login Gagal

Halaman login cuma halaman statis, jadi **bisa dibuka meskipun database bermasalah**. Buka `/api/health` atau jalankan `npm run admin:cek` untuk tahu penyebab sebenarnya.

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| "Username atau password salah" | User admin tidak ada, atau password beda | `npm run admin:cek -- --password "..."`, lalu `npm run admin:reset` |
| Login sukses lalu balik ke `/login` tanpa error | Cookie `Secure` ditolak browser saat akses HTTP | Set `COOKIE_SECURE=false`, lalu `npm run build` + `pm2 restart` |
| "Aplikasi belum siap dipakai" | Migrasi belum jalan, atau DB tidak bisa dihubungi | `npx prisma migrate deploy`, cek kredensial MariaDB |
| "Terjadi kesalahan di server" | Error tidak terklasifikasi | `pm2 logs toko-madura --lines 50` |

### Cek log login

Setiap percobaan login tercatat di log server (tanpa menyimpan password):

```bash
pm2 logs toko-madura --lines 50
```

Contoh baris:

```
[login] berhasil | user=admin | ip=192.168.1.20 | 143.2ms
[login] gagal: user_tidak_ada | user=admin | ip=192.168.1.20 | 12.4ms
[login] gagal: password_salah | user=admin | ip=192.168.1.20 | 156.1ms
[login] gagal: DB_BELUM_DIATURKAN (P2021) | user=admin | ip=192.168.1.20 | 30.1ms
```

### Endpoint health

`/api/health` mengembalikan 200 kalau siap, 503 kalau ada masalah. Detail (`error`, `masalah`) hanya ditampilkan untuk request dari `localhost`, atau set `HEALTH_DETAIL=true` kalau perlu lihat dari IP lain.

```bash
curl -s http://127.0.0.1:3010/api/health
```

```json
{
  "ok": true,
  "database_terpasang": true,
  "auth_secret_aman": true,
  "db_menjawab": true,
  "tabel_user_ada": true,
  "jumlah_user": 1,
  "admin_ada": true
}
```

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` | build production (gagal kalau `AUTH_SECRET` tidak valid) |
| `npm start` | start production server |
| `npm run lint` | linting |
| `npm run db:migrate` | deploy migration |
| `npm run db:seed` | seed data (tidak menimpa password admin) |
| `npm run db:setup` | migrate + seed |
| `npm run admin:cek` | diagnosa environment, DB, dan akun admin |
| `npm run admin:reset` | buat atau ganti password admin |
