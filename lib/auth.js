import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wm_session";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "warung-madura-dev-secret-change-me"
  );

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