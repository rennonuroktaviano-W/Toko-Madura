import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async () => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const pengaturan = await prisma.pengaturan.findFirst();
  return Response.json(pengaturan);
}, "GET /api/pengaturan");
