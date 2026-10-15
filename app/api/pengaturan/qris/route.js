import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { MAX_BYTES_FOTO, MIME_FOTO, idFotoDariUrl } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function pengaturanSekarang() {
  const ada = await prisma.pengaturan.findFirst({ orderBy: { id: "asc" } });
  if (ada) return ada;
  return prisma.pengaturan.create({
    data: {
      id: 1,
      namaToko: "Warung Madura",
      alamat: "",
      tagline: "Warung Kelontong 24 Jam",
    },
  });
}

export const POST = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const file = form.get("qris");
  if (!file || typeof file === "string") {
    return Response.json({ error: "Pilih file gambar QRIS dulu" }, { status: 400 });
  }

  const mime = String(file.type ?? "").toLowerCase();
  if (!MIME_FOTO.includes(mime)) {
    return Response.json(
      { error: "Format gambar harus JPG, PNG, atau WebP" },
      { status: 400 }
    );
  }

  const data = Buffer.from(await file.arrayBuffer());
  if (data.length === 0) {
    return Response.json({ error: "File gambar kosong" }, { status: 400 });
  }
  if (data.length > MAX_BYTES_FOTO) {
    return Response.json({ error: "Ukuran gambar maksimal 2 MB" }, { status: 400 });
  }

  const lama = await pengaturanSekarang();

  const foto = await prisma.fotoProduk.create({
    data: { mime, ukuran: data.length, data },
    select: { id: true },
  });

  const updated = await prisma.pengaturan.update({
    where: { id: lama.id },
    data: { qrisUrl: `/api/foto/${foto.id}` },
    select: { qrisUrl: true },
  });

  const idLama = idFotoDariUrl(lama.qrisUrl);
  if (idLama && idLama !== foto.id) {
    await prisma.fotoProduk.deleteMany({ where: { id: idLama } });
  }

  return Response.json({ qrisUrl: updated.qrisUrl }, { status: 201 });
}, "POST /api/pengaturan/qris");

export const DELETE = denganDb(async () => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const lama = await pengaturanSekarang();

  const updated = await prisma.pengaturan.update({
    where: { id: lama.id },
    data: { qrisUrl: null },
    select: { qrisUrl: true },
  });

  const idLama = idFotoDariUrl(lama.qrisUrl);
  if (idLama) {
    await prisma.fotoProduk.deleteMany({ where: { id: idLama } });
  }

  return Response.json({ qrisUrl: updated.qrisUrl });
}, "DELETE /api/pengaturan/qris");
