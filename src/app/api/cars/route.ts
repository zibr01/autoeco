import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    include: {
      reminders: true,
      maintenanceRecords: { orderBy: { date: "desc" }, take: 3 },
    },
    orderBy: { make: "asc" },
  });

  return NextResponse.json(cars);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.make || !data.model || !data.vin) {
      return NextResponse.json({ error: "Марка, модель и VIN обязательны" }, { status: 400 });
    }

    const existing = await prisma.car.findUnique({ where: { vin: data.vin } });
    if (existing) {
      return NextResponse.json({ error: "Автомобиль с таким VIN уже существует" }, { status: 409 });
    }

    const car = await prisma.car.create({
      data: {
        userId: user.id,
        make: data.make,
        model: data.model,
        year: Number(data.year) || new Date().getFullYear(),
        vin: data.vin,
        mileage: Number(data.mileage) || 0,
        color: data.color || "",
        engine: data.engine || "",
        transmission: data.transmission || "",
        fuelType: data.fuelType || "Бензин",
        health: data.health || 100,
        image: data.image || "",
        licensePlate: data.licensePlate || "",
        nextService: data.nextService || "не указано",
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (err) {
    console.error("Car creation error:", err);
    return NextResponse.json({ error: "Ошибка при добавлении авто" }, { status: 500 });
  }
}
