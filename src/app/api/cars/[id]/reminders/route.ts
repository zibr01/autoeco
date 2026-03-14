import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const car = await prisma.car.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Авто не найдено" }, { status: 404 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { carId: params.id },
  });

  return NextResponse.json(reminders);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const car = await prisma.car.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Авто не найдено" }, { status: 404 });
  }

  const data = await req.json();

  const reminder = await prisma.reminder.create({
    data: {
      carId: params.id,
      type: data.type,
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      dueMileage: data.dueMileage || null,
      urgency: data.urgency || "low",
      description: data.description,
    },
  });

  return NextResponse.json(reminder, { status: 201 });
}
