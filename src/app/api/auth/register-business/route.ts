import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name?.trim() || null;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim() || null;
    const city = body.city?.trim() || null;
    const serviceName = body.serviceName?.trim();
    const serviceType = body.serviceType;
    const address = body.address?.trim();
    const district = body.district?.trim() || "";
    const description = body.description?.trim() || "";

    if (!email || !password || !serviceName || !serviceType || !address || !name) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Неверный формат email" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 6 символов" },
        { status: 400 }
      );
    }

    const validTypes = ["sto", "wash", "tires", "detailing", "master", "electric"];
    if (!validTypes.includes(serviceType)) {
      return NextResponse.json(
        { error: "Неверный тип сервиса" },
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

    // Use transaction to prevent orphaned users
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone,
          city,
          role: "BUSINESS",
        },
      });

      await tx.serviceCenter.create({
        data: {
          ownerId: user.id,
          name: serviceName,
          type: serviceType,
          typeName: typeNames[serviceType] || "Автосервис",
          rating: 0,
          reviewCount: 0,
          address,
          district,
          city: city || "Москва",
          phone: phone || "",
          hours: "09:00 – 18:00",
          image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop",
          tags: JSON.stringify([]),
          description,
          priceFrom: 0,
          verified: false,
          featured: false,
          services: JSON.stringify([]),
          photos: JSON.stringify([]),
        },
      });

      return user;
    });

    return NextResponse.json({ id: result.id, email: result.email }, { status: 201 });
  } catch (error) {
    console.error("Business registration error:", error);
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
