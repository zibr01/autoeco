import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

const ALLOWED_ROLES = ["MODERATOR", "ADMIN"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const services = await prisma.serviceCenter.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      typeName: true,
      address: true,
      district: true,
      city: true,
      phone: true,
      verified: true,
      featured: true,
      rating: true,
      reviewCount: true,
      ownerId: true,
    },
  });

  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const data = await req.json();

  if (!data.name || !data.address || !data.type) {
    return NextResponse.json(
      { error: "Название, адрес и тип обязательны" },
      { status: 400 }
    );
  }

  const typeNames: Record<string, string> = {
    sto: "СТО",
    wash: "Автомойка",
    tires: "Шиномонтаж",
    detailing: "Детейлинг",
    master: "Автомастер",
    electric: "Автоэлектрик",
    parts: "Запчасти",
  };

  const service = await prisma.serviceCenter.create({
    data: {
      name: data.name,
      type: data.type,
      typeName: typeNames[data.type] || data.type,
      address: data.address,
      district: data.district || "",
      city: data.city || "Самара",
      phone: data.phone || "",
      hours: data.hours || "",
      description: data.description || "",
      image: data.image || "",
      tags: data.tags || "[]",
      services: data.services || "[]",
      photos: data.photos || "[]",
      rating: 0,
      reviewCount: 0,
      priceFrom: data.priceFrom ? Number(data.priceFrom) : 0,
      verified: false, // Unverified by default — added by moderator
      featured: false,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
