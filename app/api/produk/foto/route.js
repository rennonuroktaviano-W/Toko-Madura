import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { MAX_BYTES_FOTO, MIME_FOTO } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const file = form.get("foto");
  if (!file || typeof file === "string") {
    return Response.json({ error: "Pilih file foto dulu" }, { status: 400 });
  }

  const mime = String(file.type ?? "").toLowerCase();
  if (!MIME_FOTO.includes(mime)) {
    return Response.json(
      { error: "Format foto harus JPG, PNG, atau WebP" },
      { status: 400 }
    );
  }

  const data = Buffer.from(await file.arrayBuffer());
  if (data.length === 0) {
    return Response.json({ error: "File foto kosong" }, { status: 400 });
  }
  if (data.length > MAX_BYTES_FOTO) {
    return Response.json(
      { error: "Ukuran foto maksimal 2 MB" },
      { status: 400 }
    );
  }

  const foto = await prisma.fotoProduk.create({
    data: { mime, ukuran: data.length, data },
    select: { id: true },
  });

  return Response.json(
    { id: foto.id, url: `/api/foto/${foto.id}`, ukuran: data.length },
    { status: 201 }
  );
}, "POST /api/produk/foto");