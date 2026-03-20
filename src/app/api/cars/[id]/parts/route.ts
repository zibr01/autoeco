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

  const parts = await prisma.installedPart.findMany({
    where: { carId: params.id },
    orderBy: { installDate: "desc" },
  });

  return NextResponse.json(parts);
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

  const part = await prisma.installedPart.create({
    data: {
      carId: params.id,
      name: data.name,
      partNumber: data.partNumber || null,
      brand: data.brand || null,
      price: data.price ? Number(data.price) : null,
      installDate: new Date(data.installDate),
      installMileage: data.installMileage ? Number(data.installMileage) : null,
      purchasePlace: data.purchasePlace || null,
      warrantyMonths: data.warrantyMonths ? Number(data.warrantyMonths) : null,
      notes: data.notes || null,
    },
  });

  // Award EcoPoints for part tracking
  await prisma.$transaction([
    prisma.ecoPointsTransaction.create({
      data: {
        userId: user.id,
        amount: 15,
        type: "maintenance",
        description: "Добавлена запчасть: " + data.name,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { ecoPointsBalance: { increment: 15 } },
    }),
  ]);

  return NextResponse.json(part, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partId = searchParams.get("partId");

  if (!partId) {
    return NextResponse.json({ error: "partId обязателен" }, { status: 400 });
  }

  const car = await prisma.car.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Авто не найдено" }, { status: 404 });
  }

  await prisma.installedPart.delete({ where: { id: partId } });

  return NextResponse.json({ ok: true });
}
