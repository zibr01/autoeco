import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.serviceCenterId || !data.rating || !data.text) {
      return NextResponse.json({ error: "Сервис, рейтинг и текст обязательны" }, { status: 400 });
    }

    if (data.rating < 1 || data.rating > 5) {
      return NextResponse.json({ error: "Рейтинг от 1 до 5" }, { status: 400 });
    }

    if (data.text.length > 2000) {
      return NextResponse.json({ error: "Отзыв слишком длинный (макс. 2000 символов)" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    const review = await prisma.review.create({
      data: {
        serviceCenterId: data.serviceCenterId,
        userId: user.id,
        author: dbUser?.name || "Пользователь",
        avatar: "",
        rating: Number(data.rating),
        date: new Date(),
        text: data.text,
        carModel: data.carModel || "",
      },
    });

    // Update service center rating
    const stats = await prisma.review.aggregate({
      where: { serviceCenterId: data.serviceCenterId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.serviceCenter.update({
      where: { id: data.serviceCenterId },
      data: {
        rating: Math.round((stats._avg.rating || 0) * 10) / 10,
        reviewCount: stats._count,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка при создании отзыва" }, { status: 500 });
  }
}
