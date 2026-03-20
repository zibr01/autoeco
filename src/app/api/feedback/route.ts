import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  const { message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Сообщение обязательно" }, { status: 400 });
  }

  // Store feedback as a notification to admin
  // Find admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admin) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "system",
        title: "Обратная связь",
        message: `${user?.name || user?.email || "Аноним"}: ${message.trim()}`,
        link: null,
      },
    });
  }

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
}
