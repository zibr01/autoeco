import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") || 50), 100);
  const skip = Number(searchParams.get("skip") || 0);
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        image: true,
        role: true,
        subscription: true,
        ecoPointsBalance: true,
        ecoLevel: true,
        createdAt: true,
        _count: {
          select: {
            cars: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, take, skip });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const data = await req.json();

  if (!data.userId) {
    return NextResponse.json(
      { error: "userId обязателен" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 404 }
    );
  }

  const updateData: Record<string, string> = {};

  if (data.role) {
    const validRoles = ["USER", "BUSINESS", "MODERATOR", "ADMIN"];
    if (!validRoles.includes(data.role)) {
      return NextResponse.json(
        { error: "Недопустимая роль" },
        { status: 400 }
      );
    }
    updateData.role = data.role;
  }

  if (data.subscription) {
    const validSubs = ["FREE", "PREMIUM"];
    if (!validSubs.includes(data.subscription)) {
      return NextResponse.json(
        { error: "Недопустимая подписка" },
        { status: 400 }
      );
    }
    updateData.subscription = data.subscription;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Нет полей для обновления" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: data.userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscription: true,
    },
  });

  return NextResponse.json(updated);
}
