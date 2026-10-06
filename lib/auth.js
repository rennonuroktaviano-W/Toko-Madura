import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wm_session";
export const TIPE_ADMIN = "admin";

export const SECRET_DEV = "warung-madura-dev-secret-change-me";

export const PESAN_AUTH_SECRET =
  "AUTH_SECRET belum diset di environment server. Wajib diisi di Vercel > Settings > Environment Variables (random minimal 32 karakter), karena session login ditandatangani dengan secret ini.";

export function getSecret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw === SECRET_DEV) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(PESAN_AUTH_SECRET);
    }
    return new TextEncoder().encode(SECRET_DEV);
  }
  if (raw.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error(PESAN_AUTH_SECRET);
  }
  return new TextEncoder().encode(raw);
}

export function cookieSecureAktif() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.COOKIE_SECURE !== "false" &&
    process.env.COOKIE_SECURE !== "0"
  );
}

export async function createSessionToken(user) {
  return new SignJWT({
    nama: user.nama,
    username: user.username,
    role: user.role,
    tipe: TIPE_ADMIN,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: cookieSecureAktif(),
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};
