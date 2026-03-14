import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const part = await prisma.part.findUnique({
    where: { id: params.id },
    include: {
      offers: { orderBy: { price: "asc" } },
    },
  });

  if (!part) {
    return NextResponse.json({ error: "Запчасть не найдена" }, { status: 404 });
  }

  return NextResponse.json(part);
}
