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
    include: {
      maintenanceRecords: { orderBy: { date: "desc" } },
      reminders: { orderBy: { urgency: "asc" } },
    },
  });

  if (!car) {
    return NextResponse.json({ error: "Авто не найдено" }, { status: 404 });
  }

  return NextResponse.json(car);
}

export async function PATCH(
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

  const body = await req.json();

  // Only allow updating safe fields
  const allowed = ["make", "model", "year", "vin", "licensePlate", "mileage", "engine", "transmission", "fuelType", "image", "health", "color", "nextService"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const updated = await prisma.car.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  await prisma.car.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
