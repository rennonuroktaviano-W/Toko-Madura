import { prisma } from "./db";
import { idFotoDariUrl } from "./validasi";

export async function idFotoMasihDipakai(fotoId) {
  const id = String(fotoId ?? "").trim();
  if (!id) return false;
  const url = `/api/foto/${id}`;
  const [produk, pengaturan] = await Promise.all([
    prisma.produk.count({ where: { fotoUrl: url } }),
    prisma.pengaturan.count({ where: { qrisUrl: url } }),
  ]);
  return produk > 0 || pengaturan > 0;
}

function idFotoDari(fotoUrlAtauId) {
  const url = String(fotoUrlAtauId ?? "").trim();
  if (url.startsWith("/api/foto/")) return idFotoDariUrl(url);
  return /^[a-z0-9]{16,64}$/i.test(url) ? url : null;
}

export async function hapusFotoTakDipakai(fotoUrlAtauId) {
  const id = idFotoDari(fotoUrlAtauId);
  if (!id) return false;
  if (await idFotoMasihDipakai(id)) return false;
  const hasil = await prisma.fotoProduk.deleteMany({ where: { id } });
  return hasil.count > 0;
}
