import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;

  const car = await prisma.car.findFirst({
    where: { id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }

  const documents = await prisma.carDocument.findMany({
    where: { carId: id },
    orderBy: { createdAt: "desc" },
  });

  // Check for expiring documents (within 30 days)
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const docsWithStatus = documents.map((doc) => {
    let status: "valid" | "expiring" | "expired" = "valid";
    if (doc.expiryDate) {
      if (doc.expiryDate < now) status = "expired";
      else if (doc.expiryDate < thirtyDays) status = "expiring";
    }
    return { ...doc, status };
  });

  return NextResponse.json(docsWithStatus);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;

  const car = await prisma.car.findFirst({
    where: { id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }

  const body = await req.json();
  const { type, title, number, issueDate, expiryDate, insurer, cost, notes } = body;

  if (!type || !title) {
    return NextResponse.json({ error: "Тип и название обязательны" }, { status: 400 });
  }

  const document = await prisma.carDocument.create({
    data: {
      carId: id,
      type,
      title,
      number: number || null,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      insurer: insurer || null,
      cost: cost ? parseFloat(cost) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");

  if (!docId) {
    return NextResponse.json({ error: "docId обязателен" }, { status: 400 });
  }

  // Verify ownership
  const car = await prisma.car.findFirst({
    where: { id, userId: user.id },
  });

  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }

  // Verify document belongs to this car
  const doc = await prisma.carDocument.findFirst({
    where: { id: docId, carId: id },
  });

  if (!doc) {
    return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
  }

  await prisma.carDocument.delete({ where: { id: docId } });

  return NextResponse.json({ success: true });
}
