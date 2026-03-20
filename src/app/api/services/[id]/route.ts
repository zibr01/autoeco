import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const service = await prisma.serviceCenter.findUnique({
    where: { id: params.id },
    include: {
      priceList: true,
      reviews: { orderBy: { date: "desc" }, include: { reply: true } },
      timeSlots: true,
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Сервис не найден" }, { status: 404 });
  }

  return NextResponse.json(service);
}
