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

  // Text search at DB level using PostgreSQL case-insensitive contains
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ];
  }

  const services = await prisma.serviceCenter.findMany({
    where,
    include: {
      priceList: true,
      reviews: { take: 3, orderBy: { date: "desc" } },
    },
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
  });

  return NextResponse.json(services);
}
