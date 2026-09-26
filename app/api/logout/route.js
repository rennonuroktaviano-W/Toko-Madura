import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { tanganiRoute } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    return Response.json({ ok: true });
  } catch (err) {
    return tanganiRoute(err, "POST /api/logout");
  }
}
