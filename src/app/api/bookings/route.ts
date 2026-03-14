import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      serviceCenter: { select: { name: true, address: true } },
      car: { select: { make: true, model: true, licensePlate: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId и status обязательны" }, { status: 400 });
    }

    // Users can only cancel their own bookings
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: user.id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json({ error: "Нельзя изменить завершённую или отменённую запись" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        serviceCenter: { select: { name: true, address: true } },
        car: { select: { make: true, model: true, licensePlate: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка при обновлении записи" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.serviceCenterId || !data.carId || !data.date || !data.time) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceCenterId: data.serviceCenterId,
        carId: data.carId,
        serviceType: data.serviceType || "Запись на сервис",
        date: new Date(data.date),
        time: data.time,
        status: "pending",
      },
      include: {
        serviceCenter: { select: { name: true } },
        car: { select: { make: true, model: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при создании записи" },
      { status: 500 }
    );
  }
}
