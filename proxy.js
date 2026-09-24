import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

const PROTECTED = [
  "/",
  "/kasir",
  "/barang",
  "/kategori",
  "/riwayat",
  "/transaksi",
  "/dashboard",
];

function isProtected(pathname) {
  return PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request) {
  const { pathname, search } = new URL(request.url);
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/kasir", request.url));
    }
    return NextResponse.next();
  }

  if (isProtected(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/kasir/:path*",
    "/barang/:path*",
    "/kategori/:path*",
    "/riwayat/:path*",
    "/transaksi/:path*",
    "/dashboard/:path*",
    "/login",
  ],
};