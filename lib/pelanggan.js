import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { cookieSecureAktif, getSecret } from "./auth";

export const PELANGGAN_COOKIE = "wm_pelanggan";
export const TIPE_PELANGGAN = "pelanggan";

const MASANYA_HARI = 30;

export function idPelangganBaru() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function buatTokenPelanggan(id) {
  return new SignJWT({ tipe: TIPE_PELANGGAN, id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MASANYA_HARI}d`)
    .sign(getSecret());
}

async function bacaTokenPelanggan(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload?.tipe !== TIPE_PELANGGAN) return null;
    if (typeof payload.id !== "string" || payload.id.length < 16) return null;
    return { id: payload.id };
  } catch {
    return null;
  }
}

export const pelangganCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: cookieSecureAktif(),
  path: "/",
  maxAge: MASANYA_HARI * 24 * 60 * 60,
};

export async function pelangganSekarang() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PELANGGAN_COOKIE)?.value;
  const ada = token ? await bacaTokenPelanggan(token) : null;
  if (ada) return ada;

  const baru = { id: idPelangganBaru() };
  cookieStore.set(
    PELANGGAN_COOKIE,
    await buatTokenPelanggan(baru.id),
    pelangganCookieOptions
  );
  return baru;
}