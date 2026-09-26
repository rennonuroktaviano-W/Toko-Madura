import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";
import { namaValid, warnaValid } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async () => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const kategoris = await prisma.kategori.findMany({
    orderBy: { nama: "asc" },
    include: {
      _count: { select: { produks: { where: { status: "aktif" } } } },
    },
  });
  return Response.json(kategoris);
}, "GET /api/kategori");

export const POST = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const nama = String(body?.nama ?? "").trim();
  const warna = String(body?.warna ?? "#f59e0b").trim();

  if (!namaValid(nama)) {
    return Response.json(
      { error: `Nama kategori wajib diisi, maksimal 191 karakter` },
      { status: 400 }
    );
  }
  if (!warnaValid(warna)) {
    return Response.json({ error: "Warna tidak valid" }, { status: 400 });
  }

  try {
    const created = await prisma.kategori.create({
      data: { nama, warna },
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    if (e?.code === "P2002") {
      return Response.json(
        { error: "Nama kategori sudah dipakai" },
        { status: 409 }
      );
    }
    throw e;
  }
}, "POST /api/kategori");