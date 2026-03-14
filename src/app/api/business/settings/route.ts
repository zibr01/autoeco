import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessUser, getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET() {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  return NextResponse.json({
    id: sc.id,
    name: sc.name,
    type: sc.type,
    typeName: sc.typeName,
    address: sc.address,
    district: sc.district,
    city: sc.city,
    phone: sc.phone,
    hours: sc.hours,
    description: sc.description,
    priceFrom: sc.priceFrom,
    tags: JSON.parse(sc.tags || "[]"),
    services: JSON.parse(sc.services || "[]"),
    verified: sc.verified,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getBusinessUser();
  if (!user) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Сервис не найден" }, { status: 404 });
  }

  const body = await req.json();
  const allowed = ["name", "address", "district", "city", "phone", "hours", "description", "priceFrom"];
  const data: Record<string, unknown> = {};

  for (const key of allowed) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }

  if (body.tags) {
    data.tags = JSON.stringify(body.tags);
  }
  if (body.services) {
    data.services = JSON.stringify(body.services);
  }

  const updated = await prisma.serviceCenter.update({
    where: { id: sc.id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    address: updated.address,
    phone: updated.phone,
    hours: updated.hours,
    description: updated.description,
  });
}
