import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const car = searchParams.get("car");

  let parts = await prisma.part.findMany({
    where: category ? { category } : undefined,
    include: {
      offers: { orderBy: { price: "asc" } },
    },
  });

  // Text search in JS (SQLite limitation)
  if (search) {
    const q = search.toLowerCase();
    parts = parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (car) {
    const q = car.toLowerCase();
    parts = parts.filter((p) =>
      p.compatibleCars.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(parts);
}
