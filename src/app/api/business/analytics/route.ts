import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET() {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // ─── Monthly booking trend (last 6 months) ───
  const allBookings = await prisma.booking.findMany({
    where: {
      serviceCenterId: sc.id,
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true, status: true, serviceType: true },
  });

  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  const monthlyTrend: { month: string; total: number; completed: number; cancelled: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthBookings = allBookings.filter(
      (b) => b.createdAt >= d && b.createdAt < nextD
    );
    monthlyTrend.push({
      month: monthNames[d.getMonth()],
      total: monthBookings.length,
      completed: monthBookings.filter((b) => b.status === "completed").length,
      cancelled: monthBookings.filter((b) => b.status === "cancelled").length,
    });
  }

  // ─── Popular service types ───
  const serviceTypeCounts: Record<string, number> = {};
  for (const b of allBookings) {
    serviceTypeCounts[b.serviceType] = (serviceTypeCounts[b.serviceType] || 0) + 1;
  }
  const popularServices = Object.entries(serviceTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ─── Rating distribution ───
  const allReviews = await prisma.review.findMany({
    where: { serviceCenterId: sc.id },
    select: { rating: true, date: true },
  });
  const ratingDistribution = [1, 2, 3, 4, 5].map((stars) => ({
    stars,
    count: allReviews.filter((r) => r.rating === stars).length,
  }));

  // ─── Review trend (last 6 months) ───
  const reviewTrend: { month: string; count: number; avgRating: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthReviews = allReviews.filter((r) => r.date >= d && r.date < nextD);
    const avg = monthReviews.length > 0
      ? monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length
      : 0;
    reviewTrend.push({
      month: monthNames[d.getMonth()],
      count: monthReviews.length,
      avgRating: Math.round(avg * 10) / 10,
    });
  }

  // ─── Top clients (by booking count) ───
  const bookingsWithUsers = await prisma.booking.findMany({
    where: { serviceCenterId: sc.id },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, subscription: true } },
      car: { select: { make: true, model: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const clientMap = new Map<string, {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    visits: number;
    lastVisit: Date;
    cars: string[];
  }>();

  for (const b of bookingsWithUsers) {
    const existing = clientMap.get(b.userId);
    const carName = `${b.car.make} ${b.car.model}`;
    if (existing) {
      existing.visits++;
      if (b.createdAt > existing.lastVisit) existing.lastVisit = b.createdAt;
      if (!existing.cars.includes(carName)) existing.cars.push(carName);
    } else {
      clientMap.set(b.userId, {
        id: b.userId,
        name: b.user.name || "Клиент",
        phone: b.user.phone,
        email: b.user.email,
        visits: 1,
        lastVisit: b.createdAt,
        cars: [carName],
      });
    }
  }

  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
    .map((c) => ({ ...c, lastVisit: c.lastVisit.toISOString() }));

  // ─── Hourly distribution (which hours are busiest) ───
  const hourlyDistribution: { hour: string; count: number }[] = [];
  const hourCounts: Record<string, number> = {};
  for (const b of bookingsWithUsers) {
    const h = b.createdAt.getHours();
    const label = `${h}:00`;
    hourCounts[label] = (hourCounts[label] || 0) + 1;
  }
  for (let h = 8; h <= 20; h++) {
    const label = `${h}:00`;
    hourlyDistribution.push({ hour: label, count: hourCounts[label] || 0 });
  }

  // ─── Day of week distribution ───
  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const b of bookingsWithUsers) {
    dayCounts[b.createdAt.getDay()]++;
  }
  const weekdayDistribution = dayNames.map((name, i) => ({
    day: name,
    count: dayCounts[i],
  }));

  // ─── Key metrics ───
  const totalBookings = bookingsWithUsers.length;
  const completedBookings = bookingsWithUsers.filter((b) => b.status === "completed").length;
  const uniqueClients = clientMap.size;
  const repeatClients = Array.from(clientMap.values()).filter((c) => c.visits > 1).length;
  const repeatRate = uniqueClients > 0 ? Math.round((repeatClients / uniqueClients) * 100) : 0;
  const avgRating = allReviews.length > 0
    ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
    : 0;

  // ─── Club (PREMIUM) vs regular bookings ───
  const clubBookingsCount = bookingsWithUsers.filter((b) => b.user.subscription === "PREMIUM").length;
  const regularBookingsCount = totalBookings - clubBookingsCount;

  return NextResponse.json({
    metrics: {
      totalBookings,
      completedBookings,
      uniqueClients,
      repeatClients,
      repeatRate,
      totalReviews: allReviews.length,
      avgRating,
      clubBookingsCount,
      regularBookingsCount,
    },
    monthlyTrend,
    popularServices,
    ratingDistribution,
    reviewTrend,
    topClients,
    hourlyDistribution,
    weekdayDistribution,
  });
}
