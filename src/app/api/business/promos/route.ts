import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET() {
  try {
    const sc = await getBusinessServiceCenter();
    if (!sc) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

    const promos = await prisma.promoCode.findMany({
      where: { serviceCenterId: sc.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promos);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sc = await getBusinessServiceCenter();
    if (!sc) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

    const { code, description, discountPercent, maxUses, expiresAt } = await req.json();

    if (!code || !description || !discountPercent) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    if (discountPercent < 1 || discountPercent > 50) {
      return NextResponse.json({ error: "Скидка должна быть от 1% до 50%" }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await prisma.promoCode.findFirst({
      where: { serviceCenterId: sc.id, code: code.toUpperCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Промокод с таким кодом уже существует" }, { status: 409 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        serviceCenterId: sc.id,
        code: code.toUpperCase(),
        description,
        discountPercent,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: "Ошибка создания промокода" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const sc = await getBusinessServiceCenter();
    if (!sc) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

    const { promoId, active } = await req.json();

    if (!promoId || typeof active !== "boolean") {
      return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findFirst({
      where: { id: promoId, serviceCenterId: sc.id },
    });

    if (!promo) {
      return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
    }

    const updated = await prisma.promoCode.update({
      where: { id: promoId },
      data: { active },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sc = await getBusinessServiceCenter();
    if (!sc) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

    const { id } = await req.json();

    const promo = await prisma.promoCode.findFirst({
      where: { id, serviceCenterId: sc.id },
    });

    if (!promo) {
      return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
    }

    await prisma.promoCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
