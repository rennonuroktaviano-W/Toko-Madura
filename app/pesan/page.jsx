import { prisma } from "@/lib/db";
import PesanPage from "@/components/PesanPage";

export const dynamic = "force-dynamic";

async function ambilToko() {
  const pengaturan = await prisma.pengaturan
    .findFirst({ orderBy: { id: "asc" } })
    .catch(() => null);

  return {
    namaToko: pengaturan?.namaToko || "Warung Madura",
    tagline: pengaturan?.tagline || "Kasir 24 Jam",
    alamat: pengaturan?.alamat || "",
    qrisUrl: pengaturan?.qrisUrl || null,
  };
}

export async function generateMetadata() {
  const { namaToko } = await ambilToko();
  return { title: `Pesanan Online - ${namaToko}` };
}

export default async function PesanRoute() {
  const toko = await ambilToko();
  return <PesanPage toko={toko} />;
}