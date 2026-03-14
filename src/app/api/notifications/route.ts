import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const now = new Date();
  const notifications: {
    id: string;
    type: "reminder" | "booking" | "maintenance";
    title: string;
    description: string;
    urgency: "low" | "medium" | "high";
    date: string;
    read: boolean;
  }[] = [];

  // 1. Reminders from user's cars
  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    include: {
      reminders: true,
    },
  });

  for (const car of cars) {
    const carName = `${car.make} ${car.model}`;
    for (const r of car.reminders) {
      notifications.push({
        id: `reminder-${r.id}`,
        type: "reminder",
        title: r.title,
        description: `${carName} · ${r.description}`,
        urgency: r.urgency as "low" | "medium" | "high",
        date: r.dueDate?.toISOString() || now.toISOString(),
        read: false,
      });
    }
  }

  // 2. Upcoming/recent bookings
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      serviceCenter: { select: { name: true } },
      car: { select: { make: true, model: true } },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  for (const b of bookings) {
    const carName = `${b.car.make} ${b.car.model}`;
    const isUpcoming = b.date >= now && b.status !== "cancelled";
    const isConfirmed = b.status === "confirmed";
    const isCompleted = b.status === "completed";

    if (isUpcoming) {
      notifications.push({
        id: `booking-${b.id}`,
        type: "booking",
        title: isConfirmed ? "Запись подтверждена" : "Ожидает подтверждения",
        description: `${b.serviceType} · ${carName} · ${b.serviceCenter.name}`,
        urgency: isConfirmed ? "low" : "medium",
        date: b.date.toISOString(),
        read: false,
      });
    } else if (isCompleted) {
      const daysSince = Math.floor((now.getTime() - b.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince <= 7) {
        notifications.push({
          id: `booking-done-${b.id}`,
          type: "booking",
          title: "Визит завершён",
          description: `${b.serviceType} · ${carName} · ${b.serviceCenter.name}`,
          urgency: "low",
          date: b.date.toISOString(),
          read: true,
        });
      }
    }
  }

  // Sort: high urgency first, then by date desc
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  notifications.sort((a, b) => {
    const uDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (uDiff !== 0) return uDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({
    notifications: notifications.slice(0, 15),
    unreadCount,
  });
}
