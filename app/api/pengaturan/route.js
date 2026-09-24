import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const pengaturan = await prisma.pengaturan.findFirst();
  return Response.json(pengaturan);
}