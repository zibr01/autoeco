import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: Record<string, unknown> = { serviceCenterId: sc.id };
  if (status && status !== "all") {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        car: { select: { make: true, model: true, year: true, licensePlate: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { bookingId, status } = await req.json();

  if (!bookingId || !status) {
    return NextResponse.json({ error: "bookingId и status обязательны" }, { status: 400 });
  }

  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, serviceCenterId: sc.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      car: { select: { make: true, model: true, year: true, licensePlate: true } },
    },
  });

  const statusMessages: Record<string, { type: string; title: string }> = {
    confirmed: { type: "booking_confirmed", title: "Запись подтверждена" },
    cancelled: { type: "booking_cancelled", title: "Запись отменена сервисом" },
    completed: { type: "booking_confirmed", title: "Визит завершён" },
  };

  const msg = statusMessages[status];
  if (msg) {
    await createNotification({
      userId: booking.userId,
      type: msg.type,
      title: msg.title,
      message: `${booking.serviceType} · ${sc.name}`,
      link: `/services/${sc.id}`,
    });
  }

  return NextResponse.json(updated);
}
