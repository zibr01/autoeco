import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sendSubscriptionRequest } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phone: string = body.phone || "";

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && fullUser?.email) {
      await sendSubscriptionRequest(adminEmail, {
        userName: fullUser.name || "Пользователь",
        userEmail: fullUser.email,
        userPhone: phone,
      });
    }

    await createNotification({
      userId: user.id,
      type: "subscription_requested",
      title: "Заявка на клубную карту отправлена",
      message: "Мы свяжемся с вами в течение 24 часов для активации карты.",
    });

    return NextResponse.json({ message: "Заявка отправлена" });
  } catch {
    return NextResponse.json({ error: "Ошибка при отправке заявки" }, { status: 500 });
  }
}
