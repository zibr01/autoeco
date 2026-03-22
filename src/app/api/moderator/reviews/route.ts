import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "MODERATOR"].includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const take = parseInt(searchParams.get("take") || "20", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const serviceCenterId = searchParams.get("serviceCenterId");

  const where = serviceCenterId ? { serviceCenterId } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      skip,
      include: {
        serviceCenter: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "MODERATOR"].includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }

  const { serviceCenterId } = review;

  await prisma.review.delete({ where: { id } });

  // Recalculate service center rating
  const stats = await prisma.review.aggregate({
    where: { serviceCenterId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.serviceCenter.update({
    where: { id: serviceCenterId },
    data: {
      rating: Math.round((stats._avg.rating || 0) * 10) / 10,
      reviewCount: stats._count,
    },
  });

  return NextResponse.json({ success: true });
}
