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

  const expenses = await prisma.expense.findMany({
    where: { carId: params.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
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

  const expense = await prisma.expense.create({
    data: {
      carId: params.id,
      category: data.category,
      amount: Number(data.amount),
      date: new Date(data.date),
      description: data.description || null,
      mileage: data.mileage ? Number(data.mileage) : null,
    },
  });

  // Award EcoPoints for expense tracking
  await prisma.$transaction([
    prisma.ecoPointsTransaction.create({
      data: {
        userId: user.id,
        amount: 10,
        type: "expense",
        description: "Запись расхода на авто",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { ecoPointsBalance: { increment: 10 } },
    }),
  ]);

  return NextResponse.json(expense, { status: 201 });
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
  const expenseId = searchParams.get("expenseId");

  if (!expenseId) {
    return NextResponse.json({ error: "expenseId обязателен" }, { status: 400 });
  }

  const car = await prisma.car.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Авто не найдено" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  return NextResponse.json({ ok: true });
}
