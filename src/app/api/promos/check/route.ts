import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const { code, serviceCenterId } = await req.json();

    if (!code || !serviceCenterId) {
      return NextResponse.json({ valid: false, error: "Укажите код и сервисный центр" });
    }

    const promo = await prisma.promoCode.findUnique({
      where: {
        serviceCenterId_code: { serviceCenterId, code: code.toUpperCase() },
      },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Промокод не найден" });
    }

    if (!promo.active) {
      return NextResponse.json({ valid: false, error: "Промокод неактивен" });
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "Промокод истёк" });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "Лимит использований исчерпан" });
    }

    return NextResponse.json({
      valid: true,
      discountPercent: promo.discountPercent,
      description: promo.description,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Ошибка проверки" }, { status: 500 });
  }
}
