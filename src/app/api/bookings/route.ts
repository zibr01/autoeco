import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { sendBookingConfirmation, sendBookingCancellation } from "@/lib/email";

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

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
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

    if (status === "cancelled") {
      await createNotification({
        userId: user.id,
        type: "booking_cancelled",
        title: "Запись отменена",
        message: `${updated.serviceType} · ${updated.car.make} ${updated.car.model} · ${updated.serviceCenter.name}`,
        link: `/services/${updated.serviceCenterId}`,
      });

      const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, name: true } });
      if (fullUser?.email) {
        const dateStr = updated.date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
        await sendBookingCancellation(fullUser.email, {
          userName: fullUser.name || "Пользователь",
          serviceName: updated.serviceCenter.name,
          date: dateStr,
        });
      }
    }

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

    // Normalize date to midnight UTC for consistent day-level comparison
    const raw = new Date(data.date);
    const bookingDate = new Date(Date.UTC(raw.getFullYear(), raw.getMonth(), raw.getDate()));

    // Check for double booking (same service center, date, time)
    const nextDay = new Date(bookingDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        serviceCenterId: data.serviceCenterId,
        date: { gte: bookingDate, lt: nextDay },
        time: data.time,
        status: { notIn: ["cancelled"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Это время уже занято. Выберите другое время." },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceCenterId: data.serviceCenterId,
        carId: data.carId,
        serviceType: data.serviceType || "Запись на сервис",
        date: bookingDate,
        time: data.time,
        status: "pending",
      },
      include: {
        serviceCenter: { select: { name: true } },
        car: { select: { make: true, model: true } },
      },
    });

    await createNotification({
      userId: user.id,
      type: "booking_created",
      title: "Запись создана",
      message: `${booking.serviceType} · ${booking.car.make} ${booking.car.model} · ${booking.serviceCenter.name}`,
      link: `/services/${data.serviceCenterId}`,
    });

    const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, name: true } });
    if (fullUser?.email) {
      const sc = await prisma.serviceCenter.findUnique({ where: { id: data.serviceCenterId }, select: { address: true } });
      const dateStr = booking.date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
      await sendBookingConfirmation(fullUser.email, {
        userName: fullUser.name || "Пользователь",
        serviceName: booking.serviceCenter.name,
        serviceAddress: sc?.address || "",
        date: dateStr,
        time: booking.time,
        carName: `${booking.car.make} ${booking.car.model}`,
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при создании записи" },
      { status: 500 }
    );
  }
}
