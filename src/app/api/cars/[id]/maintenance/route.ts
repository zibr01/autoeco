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

  const records = await prisma.maintenanceRecord.findMany({
    where: { carId: params.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
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

  // Support batch creation: accept an array of records
  if (Array.isArray(data)) {
    const records = await prisma.maintenanceRecord.createMany({
      data: data.map((item: { date: string; mileage: number; type: string; description: string; cost: number; serviceName: string }) => ({
        carId: params.id,
        date: new Date(item.date),
        mileage: item.mileage,
        type: item.type,
        description: item.description,
        cost: item.cost,
        serviceName: item.serviceName,
      })),
    });
    return NextResponse.json({ count: records.count }, { status: 201 });
  }

  const record = await prisma.maintenanceRecord.create({
    data: {
      carId: params.id,
      date: new Date(data.date),
      mileage: data.mileage,
      type: data.type,
      description: data.description,
      cost: data.cost,
      serviceName: data.serviceName,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
