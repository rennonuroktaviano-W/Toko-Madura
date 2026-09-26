# Kasir Warung Madura

Aplikasi kasir (point of sale) untuk warung kelontong Madura. Dibuat dengan
Next.js 16 (App Router, Turbopack) + Prisma 7 + MySQL/MariaDB.

## Fitur

- **Kasir** — keranjang, pencarian barang, pilih metode bayar (Tunai / QRIS),
  cetak struk, riwayat pesanan, upload foto barang.
- **Barang** — CRUD barang, restock, filter kategori/status, penanda stok menipis.
- **Kategori** — CRUD kategori dengan warna.
- **Riwayat** — daftar transaksi dengan filter rentang tanggal + ringkasan omzet.
- **Dashboard** — omzet hari ini, tren 7 hari, barang terlaris, stok menipis.
- **Login** — session cookie ditandatangani dengan `AUTH_SECRET` (HMAC via `jose`),
  dilindungi `proxy.js` (middleware).

## Menjalankan di lokal

Butuh Node.js >= 20 dan MySQL/MariaDB yang sudah jalan.

```bash
npm install
cp .env.example .env      # lalu isi DATABASE_URL & AUTH_SECRET
npm run db:setup          # prisma migrate deploy + prisma db seed
npm run dev
```

Buka http://localhost:3000 · akun demo: `admin` / `admin123`

### Variabel environment

| Nama | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ya | `mysql://USER:PASSWORD@HOST:PORT/NAMA_DB` |
| `AUTH_SECRET` | ya | Random minimal 32 karakter. Jangan pakai nilai default dev. |
| `DATABASE_SSL` | tidak | `true`/`false` untuk override otomatis SSL. Default: aktif untuk host non-localhost. |

`DATABASE_URL` boleh ditulis **dengan atau tanpa tanda kutip** — `lib/adapter.js`
membuang kutip yang membungkus nilai (`buangKutip`).

Buat `AUTH_SECRET` dengan:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Setup production (Vercel)

Aplikasi ini butuh database MySQL yang terjangkau dari internet. MySQL di
localhost tidak akan bekerja untuk Vercel.

### 1. Siapkan database

Salah satu pilihan:

| Provider | Catatan |
|---|---|
| **Aiven for MySQL** | Free tier, tanpa kartu kredit, MySQL 8 asli. Paling mudah. |
| TiDB Cloud Starter | Free, MySQL-kompatibel, tapi username ber-prefix dan port 4000. |
| VPS sendiri | Kalau sudah punya hosting. |

Buat database MySQL, lalu ambil `Host`, `Port`, `User`, `Password`, dan nama
database dari halaman provider.

### 2. Isi env var di Vercel

Vercel → project → **Settings → Environment Variables**, lalu set:

```
DATABASE_URL = mysql://USER:PASSWORD@HOST:PORT/NAMA_DB
AUTH_SECRET  = <random 32+ karakter>
```

Yang perlu diperhatikan:

- **Jangan bungkus nilainya dengan tanda kutip** dan jangan pakai `< >`.
- **Percent-encode password** kalau mengandung karakter khusus:
  `@` → `%40`, `:` → `%3A`, `/` → `%2F`, `?` → `%3F`, `#` → `%23`, `&` → `%26`.
  Contoh: password `p@ss:word` → `p%40ss%3Aword`.
- Centang environment **Production** (dan **Preview** agar preview deploy juga
  ikut berfungsi).
- Setelah mengubah env var, Vercel otomatis deploy ulang.

### 3. Jalankan migrasi ke database production

```bash
# pakai DATABASE_URL production, JANGAN database lokal
$env:DATABASE_URL = "mysql://USER:PASSWORD@HOST:PORT/NAMA_DB"
npx prisma migrate deploy   # bikin tabel dari prisma/migrations/
npx prisma db seed          # isi admin + kategori + produk contoh
```

> **Kenapa `prisma migrate deploy` tidak ditaruh di `vercel.json`?**
> `buildCommand` sengaja dibiarkan `prisma generate && next build`. Kalau migrasi
> ikut di dalam build, satu migrasi yang gagal akan ikut menggagalkan seluruh
> build dan deployment. Migrasi lebih aman dijalankan manual setelah
> `DATABASE_URL` terisi.

### 4. Verifikasi

```bash
curl https://<domain-anda>/api/health
```

`ok: true` berarti `DATABASE_URL` terisi, `AUTH_SECRET` aman, dan database
menjawab. Kalau belum, endpoint itu menjelaskan masalahnya di `masalah[]` dan
`database_url_ada` (false = nilainya kosong, true = terisi tapi tidak bisa
di-parse).

## Endpoint diagnosis

`GET /api/health` adalah satu-satunya endpoint yang melaporkan detail teknis
konfigurasi:

```json
{
  "ok": false,
  "database_url_ada": true,
  "database_terpasang": true,
  "auth_secret_aman": true,
  "ssl_aktif": true,
  "db_menjawab": false,
  "latensi_ms": 12,
  "error": "Koneksi database gagal (P1001).",
  "masalah": ["Koneksi database gagal (P1001)."]
}
```

Return **503** kalau ada masalah, **200** kalau semuanya sehat.

## Kontrak error API

Semua route database dibungkus `denganDb()` dari `lib/api-error.js`, jadi tidak
pernah melempar HTTP 500 mentah. Yang dikembalikan:

| `kode` | HTTP | Arti |
|---|---|---|
| `DB_BELUM_DIATURKAN` | 503 | `DATABASE_URL` kosong/tidak bisa di-parse. |
| `DB_GAGAL` | 503 | Database tidak bisa dihubungi. |
| `AUTH_BELUM_DIATURKAN` | 503 | `AUTH_SECRET` belum diset di production. |
| `INTERNAL` | 500 | Bug yang tidak terduga (detail hanya di development). |

Halaman kasir tidak pernah menampilkan teks teknis: kode di atas dipakai
`lib/use-api.js` untuk merender komponen `components/BelumSiap.jsx`.

## Catatan Keamanan

- `app/login/page.jsx` masih menampilkan **akun demo** (`admin` / `admin123`) di
  halaman login. Ini tidak aman untuk production — hapus baris tersebut sebelum
  aplikasi dipakai sungguhan.
- Ganti password demo, dan pakai `AUTH_SECRET` yang unik per environment.
