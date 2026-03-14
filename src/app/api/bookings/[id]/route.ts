import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  const { status } = await req.json();

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: { status },
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

  const booking = await prisma.booking.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  await prisma.booking.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
