import { cookies } from "next/headers";
import { SESSION_COOKIE, TIPE_ADMIN, verifySessionToken } from "./auth";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session || session.tipe !== TIPE_ADMIN) return null;
  return session;
}

export function unauthorized() {
  return Response.json({ error: "Tidak ada akses" }, { status: 401 });
}