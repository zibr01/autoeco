import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { message, page } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Сообщение обязательно" }, { status: 400 });
    }

    if (!page?.trim()) {
      return NextResponse.json({ error: "Страница обязательна" }, { status: 400 });
    }

    await prisma.feedback.create({
      data: {
        message: message.trim(),
        page: page.trim(),
        userId: user?.id ?? undefined,
        userName: user?.name || user?.email || "Аноним",
        userEmail: user?.email || undefined,
      },
    });

    // Award EcoPoints if user is logged in
    if (user) {
      await prisma.$transaction([
        prisma.ecoPointsTransaction.create({
          data: {
            userId: user.id,
            amount: 20,
            type: "review",
            description: "Обратная связь о платформе",
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { ecoPointsBalance: { increment: 20 } },
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback POST error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
