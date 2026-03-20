import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

const typeNames: Record<string, string> = {
  sto: "Автосервис",
  wash: "Автомойка",
  tires: "Шиномонтаж",
  detailing: "Детейлинг и мойка",
  master: "Частный мастер",
  electric: "Автоэлектрик",
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.name || !data.type || !data.address || !data.district || !data.phone) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    const service = await prisma.serviceCenter.create({
      data: {
        ownerId: user.id,
        name: data.name,
        type: data.type,
        typeName: typeNames[data.type] || "Автосервис",
        rating: 0,
        reviewCount: 0,
        address: data.address,
        district: data.district,
        city: "Самара",
        phone: data.phone,
        hours: data.hours || "09:00 – 18:00",
        image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop",
        tags: JSON.stringify([]),
        description: data.description || "",
        priceFrom: data.priceFrom || 0,
        verified: false,
        featured: false,
        services: JSON.stringify([]),
        photos: JSON.stringify([]),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при создании сервиса" },
      { status: 500 }
    );
  }
}
