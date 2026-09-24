import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, ctx) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await ctx.params;

  const transaksi = await prisma.transaksi.findUnique({
    where: { id: String(id) },
    include: {
      kasir: { select: { id: true, nama: true, username: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  if (!transaksi) {
    return Response.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return Response.json(transaksi);
}