import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET(req: NextRequest) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const [reviews, total, avgRating] = await Promise.all([
    prisma.review.findMany({
      where: { serviceCenterId: sc.id },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { reply: true },
    }),
    prisma.review.count({ where: { serviceCenterId: sc.id } }),
    prisma.review.aggregate({
      where: { serviceCenterId: sc.id },
      _avg: { rating: true },
    }),
  ]);

  const ratingDistribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { serviceCenterId: sc.id },
    _count: true,
  });

  return NextResponse.json({
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    avgRating: avgRating._avg.rating || 0,
    ratingDistribution: ratingDistribution.map((r) => ({
      rating: r.rating,
      count: r._count,
    })),
  });
}
