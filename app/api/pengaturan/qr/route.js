import QRCode from "qrcode";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { denganDb } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = denganDb(async (request) => {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const asal = (process.env.PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
  const tujuan = `${asal || url.origin}/pesan`;

  const svg = await QRCode.toString(tujuan, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#5b3a1e", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}, "GET /api/pengaturan/qr");