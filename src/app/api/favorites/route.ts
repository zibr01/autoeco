import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      serviceCenter: {
        select: {
          id: true,
          name: true,
          type: true,
          typeName: true,
          rating: true,
          reviewCount: true,
          address: true,
          image: true,
          verified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites.map((f) => ({
    id: f.id,
    serviceCenterId: f.serviceCenterId,
    serviceCenter: f.serviceCenter,
  })));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { serviceCenterId } = await request.json();
  if (!serviceCenterId) {
    return NextResponse.json({ error: "serviceCenterId is required" }, { status: 400 });
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_serviceCenterId: { userId: user.id, serviceCenterId },
    },
    update: {},
    create: { userId: user.id, serviceCenterId },
  });

  return NextResponse.json(favorite, { status: 201 });
}
