import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    select: { id: true },
  });

  const carIds = cars.map((c) => c.id);
  if (carIds.length === 0) {
    return NextResponse.json({ monthly: [], byCategory: [], totalSpent: 0 });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const records = await prisma.maintenanceRecord.findMany({
    where: {
      carId: { in: carIds },
      date: { gte: sixMonthsAgo },
    },
    select: { date: true, type: true, cost: true },
    orderBy: { date: "asc" },
  });

  // Group by month
  const monthlyMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  let totalSpent = 0;

  for (const r of records) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + r.cost);
    categoryMap.set(r.type, (categoryMap.get(r.type) || 0) + r.cost);
    totalSpent += r.cost;
  }

  // Fill missing months
  const monthly = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.push({
      month: d.toLocaleDateString("ru", { month: "short" }),
      year: d.getFullYear(),
      total: monthlyMap.get(key) || 0,
    });
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([type, total]) => ({ type, total }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ monthly, byCategory, totalSpent });
}
