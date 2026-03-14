import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, city, serviceName, serviceType, address, district, description } = await req.json();

    if (!email || !password || !serviceName || !serviceType || !address) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 6 символов" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const typeNames: Record<string, string> = {
      sto: "Автосервис",
      wash: "Автомойка",
      tires: "Шиномонтаж",
      detailing: "Детейлинг и мойка",
      master: "Частный мастер",
      electric: "Автоэлектрик",
    };

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        city,
        role: "BUSINESS",
      },
    });

    await prisma.serviceCenter.create({
      data: {
        ownerId: user.id,
        name: serviceName,
        type: serviceType,
        typeName: typeNames[serviceType] || "Автосервис",
        rating: 0,
        reviewCount: 0,
        address,
        district: district || "",
        city: city || "Москва",
        phone: phone || "",
        hours: "09:00 – 18:00",
        image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop",
        tags: JSON.stringify([]),
        description: description || "",
        priceFrom: 0,
        verified: false,
        featured: false,
        services: JSON.stringify([]),
        photos: JSON.stringify([]),
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Business registration error:", error);
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
