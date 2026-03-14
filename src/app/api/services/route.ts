import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const district = searchParams.get("district");
  const search = searchParams.get("search");
  const minRating = searchParams.get("minRating");

  const where: Record<string, unknown> = {};

  if (type) where.type = type;
  if (district) where.district = district;
  if (minRating) where.rating = { gte: parseFloat(minRating) };

  let services = await prisma.serviceCenter.findMany({
    where,
    include: {
      priceList: true,
      reviews: { take: 3, orderBy: { date: "desc" } },
    },
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
  });

  // Text search (SQLite doesn't support full-text, filter in JS)
  if (search) {
    const q = search.toLowerCase();
    services = services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(services);
}
