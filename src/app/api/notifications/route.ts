import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  // 1. DB notifications
  const dbNotifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 2. Dynamic reminder-based notifications
  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    include: { reminders: true },
  });

  const reminderNotifications = [];
  for (const car of cars) {
    const carName = `${car.make} ${car.model}`;
    for (const r of car.reminders) {
      reminderNotifications.push({
        id: `reminder-${r.id}`,
        userId: user.id,
        type: "reminder_due",
        title: r.title,
        message: `${carName} · ${r.description}`,
        link: `/garage/${car.id}`,
        read: false,
        createdAt: r.dueDate?.toISOString() || new Date().toISOString(),
        urgency: r.urgency,
      });
    }
  }

  // 3. Merge & sort
  const all = [
    ...dbNotifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      urgency: null as string | null,
    })),
    ...reminderNotifications,
  ];

  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = all.filter((n) => !n.read).length;

  return NextResponse.json({
    notifications: all.slice(0, 30),
    unreadCount,
  });
}
