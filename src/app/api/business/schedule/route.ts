import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET() {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const timeSlots = await prisma.timeSlot.findMany({
    where: { serviceCenterId: sc.id },
    orderBy: { time: "asc" },
  });

  return NextResponse.json({ timeSlots, hours: sc.hours });
}

export async function POST(req: NextRequest) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { time, available } = await req.json();

  if (!time) {
    return NextResponse.json({ error: "Укажите время" }, { status: 400 });
  }

  const existing = await prisma.timeSlot.findFirst({
    where: { serviceCenterId: sc.id, time },
  });

  if (existing) {
    const updated = await prisma.timeSlot.update({
      where: { id: existing.id },
      data: { available: available ?? true },
    });
    return NextResponse.json(updated);
  }

  const slot = await prisma.timeSlot.create({
    data: {
      serviceCenterId: sc.id,
      time,
      available: available ?? true,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { slotId } = await req.json();

  const slot = await prisma.timeSlot.findFirst({
    where: { id: slotId, serviceCenterId: sc.id },
  });

  if (!slot) {
    return NextResponse.json({ error: "Слот не найден" }, { status: 404 });
  }

  await prisma.timeSlot.delete({ where: { id: slotId } });

  return NextResponse.json({ success: true });
}
