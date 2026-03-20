import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET() {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalBookings,
    monthBookings,
    lastMonthBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    recentBookings,
    reviews,
    totalReviews,
  ] = await Promise.all([
    prisma.booking.count({ where: { serviceCenterId: sc.id } }),
    prisma.booking.count({
      where: { serviceCenterId: sc.id, createdAt: { gte: startOfMonth } },
    }),
    prisma.booking.count({
      where: {
        serviceCenterId: sc.id,
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
    prisma.booking.count({
      where: { serviceCenterId: sc.id, status: "pending" },
    }),
    prisma.booking.count({
      where: { serviceCenterId: sc.id, status: "confirmed" },
    }),
    prisma.booking.count({
      where: { serviceCenterId: sc.id, status: "completed" },
    }),
    prisma.booking.findMany({
      where: { serviceCenterId: sc.id },
      include: { user: { select: { name: true, phone: true } }, car: { select: { make: true, model: true, year: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      where: { serviceCenterId: sc.id },
      orderBy: { date: "desc" },
      take: 3,
    }),
    prisma.review.count({ where: { serviceCenterId: sc.id } }),
  ]);

  // Weekly trend (last 4 weeks)
  const weeklyTrend = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const count = await prisma.booking.count({
      where: { serviceCenterId: sc.id, createdAt: { gte: weekStart, lt: weekEnd } },
    });
    weeklyTrend.push({
      week: `${weekStart.getDate()}.${weekStart.getMonth() + 1}`,
      count,
    });
  }

  // Favorites count
  const favoritesCount = await prisma.favorite.count({
    where: { serviceCenterId: sc.id },
  });

  // Active promo codes
  const activePromos = await prisma.promoCode.count({
    where: { serviceCenterId: sc.id, active: true },
  });

  const growthPercent = lastMonthBookings > 0
    ? Math.round(((monthBookings - lastMonthBookings) / lastMonthBookings) * 100)
    : monthBookings > 0 ? 100 : 0;

  const conversionRate = totalBookings > 0
    ? Math.round((completedBookings / totalBookings) * 100)
    : 0;

  return NextResponse.json({
    serviceCenter: {
      id: sc.id,
      name: sc.name,
      type: sc.type,
      typeName: sc.typeName,
      rating: sc.rating,
      reviewCount: sc.reviewCount,
      verified: sc.verified,
    },
    stats: {
      totalBookings,
      monthBookings,
      growthPercent,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalReviews,
      rating: sc.rating,
      conversionRate,
      favoritesCount,
      activePromos,
    },
    weeklyTrend,
    recentBookings,
    recentReviews: reviews,
  });
}
