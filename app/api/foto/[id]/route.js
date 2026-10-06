import { prisma } from "@/lib/db";
import { denganDb } from "@/lib/api-error";

export const runtime = "nodejs";

export const GET = denganDb(async (request, ctx) => {
  const { id } = await ctx.params;
  const fotoId = String(id ?? "");
  if (!/^[a-z0-9]{16,64}$/i.test(fotoId)) {
    return Response.json({ error: "Foto tidak ditemukan" }, { status: 404 });
  }

  const foto = await prisma.fotoProduk.findUnique({
    where: { id: fotoId },
    select: { mime: true, data: true },
  });

  if (!foto) {
    return Response.json({ error: "Foto tidak ditemukan" }, { status: 404 });
  }

  return new Response(new Uint8Array(foto.data), {
    headers: {
      "Content-Type": foto.mime,
      "Content-Length": String(foto.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}, "GET /api/foto/[id]");