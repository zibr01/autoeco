import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalBusinesses,
    totalServices,
    totalBookings,
    totalReviews,
    newUsersThisMonth,
    newBookingsThisMonth,
    verifiedServices,
    unverifiedServices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "BUSINESS" } }),
    prisma.serviceCenter.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.serviceCenter.count({ where: { verified: true } }),
    prisma.serviceCenter.count({ where: { verified: false } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalBusinesses,
    totalServices,
    totalBookings,
    totalReviews,
    newUsersThisMonth,
    newBookingsThisMonth,
    verifiedServices,
    unverifiedServices,
  });
}
