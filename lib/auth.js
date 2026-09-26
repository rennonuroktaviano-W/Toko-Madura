import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wm_session";

const SECRET_DEV = "warung-madura-dev-secret-change-me";

export const PESAN_AUTH_SECRET =
  "AUTH_SECRET belum diset di environment server. Wajib diisi di Vercel > Settings > Environment Variables (random minimal 32 karakter), karena session login ditandatangani dengan secret ini.";

function getSecret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw === SECRET_DEV) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(PESAN_AUTH_SECRET);
    }
    return new TextEncoder().encode(SECRET_DEV);
  }
  return new TextEncoder().encode(raw);
}

export async function createSessionToken(user) {
  return new SignJWT({
    nama: user.nama,
    username: user.username,
    role: user.role,
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
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};
