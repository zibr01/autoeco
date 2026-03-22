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

  const notifications = await prisma.notification.findMany({
    where: {
      type: { contains: "subscription" },
    },
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          subscription: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  // Фильтруем: показываем только тех, кто ещё USER + FREE (ожидает одобрения)
  const pending = notifications.filter(
    (n) => n.user.role === "USER" && n.user.subscription === "FREE"
  );

  return NextResponse.json({ pending, total: pending.length });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const data = await req.json();

  if (!data.userId || !data.subscription) {
    return NextResponse.json(
      { error: "userId и subscription обязательны" },
      { status: 400 }
    );
  }

  const validSubs = ["FREE", "PREMIUM"];
  if (!validSubs.includes(data.subscription)) {
    return NextResponse.json(
      { error: "Недопустимая подписка" },
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

  const updated = await prisma.user.update({
    where: { id: data.userId },
    data: { subscription: data.subscription },
    select: {
      id: true,
      name: true,
      email: true,
      subscription: true,
    },
  });

  // Уведомляем пользователя об изменении подписки
  await prisma.notification.create({
    data: {
      userId: data.userId,
      type: "subscription_updated",
      title:
        data.subscription === "PREMIUM"
          ? "Премиум активирован"
          : "Подписка изменена",
      message:
        data.subscription === "PREMIUM"
          ? "Ваша премиум-подписка активирована администратором. Наслаждайтесь привилегиями!"
          : "Ваша подписка была изменена на бесплатную.",
      link: "/profile",
    },
  });

  return NextResponse.json(updated);
}
