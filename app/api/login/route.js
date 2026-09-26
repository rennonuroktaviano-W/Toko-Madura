import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const HASH_PALUAN = "$2b$10$Ow5S6OjPexN0zchxIksmXu1U4ADJCWa0OnVXHpY6E3KrI.qQyz7eq";

const GAGAL = { error: "Username atau password salah" };

function timing(header) {
  return { headers: { "Server-Timing": header } };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const username = String(body?.username ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!username || !password) {
    return Response.json(
      { error: "Username dan password wajib diisi" },
      { status: 400 }
    );
  }

  const mulai = performance.now();
  let geser = mulai;
  const tandai = (nama) => {
    const dur = performance.now() - geser;
    geser = performance.now();
    return `${nama};dur=${dur.toFixed(1)}`;
  };

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    const geserDb = tandai("db");

    const match = await bcrypt.compare(password, user?.password ?? HASH_PALUAN);
    const geserBcrypt = tandai("bcrypt");

    if (!user || !match) {
      return Response.json(GAGAL, { status: 401, ...timing(`${geserDb}, ${geserBcrypt}`) });
    }

    const token = await createSessionToken({
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);

    return Response.json(
      {
        ok: true,
        user: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          role: user.role,
        },
      },
      { headers: { "Server-Timing": `${geserDb}, ${geserBcrypt}, total;dur=${(performance.now() - mulai).toFixed(1)}` } }
    );
  } catch (err) {
    const pesan = String(err?.message ?? "");
    const konfigurasi =
      /DATABASE_URL belum diset/.test(pesan) || /AUTH_SECRET belum diset/.test(pesan);
    const dbJebol =
      konfigurasi ||
      err?.code === "P1001" ||
      err?.code === "P1002" ||
      err?.code === "P2039" ||
      /connect|timeout|ECONNREFUSED|ER_ACCESS_DENIED|ER_GET_CONNECTION|pool|SSL/i.test(
        pesan
      );

    return Response.json(
      {
        error: konfigurasi
          ? "Server belum dikonfigurasi lengkap (lihat /api/health)."
          : dbJebol
            ? "Database tidak bisa dihubungi. Coba lagi sebentar."
            : "Terjadi kesalahan di server. Coba lagi.",
        detail: process.env.NODE_ENV === "production" ? undefined : pesan,
      },
      { status: dbJebol ? 503 : 500, ...timing(`total;dur=${(performance.now() - mulai).toFixed(1)}`) }
    );
  }
}
