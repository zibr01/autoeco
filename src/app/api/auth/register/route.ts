import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name?.trim() || null;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim() || null;
    const city = body.city?.trim() || null;
    const referralCode = body.referralCode?.trim() || null;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Неверный формат email" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Имя обязательно" },
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

    // Validate referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true },
      });
      // Silently ignore invalid referral codes
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique referral code for new user
    let newReferralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.user.findUnique({ where: { referralCode: newReferralCode } });
      if (!exists) break;
      newReferralCode = generateReferralCode();
      attempts++;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        city,
        referralCode: newReferralCode,
        referredById: referrer?.id || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Award EcoPoints to both users if referral is valid
    if (referrer) {
      await prisma.$transaction([
        // New user gets 300 points
        prisma.ecoPointsTransaction.create({
          data: {
            userId: user.id,
            amount: 300,
            type: "referral",
            description: "Бонус за регистрацию по приглашению",
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { ecoPointsBalance: { increment: 300 } },
        }),
        // Referrer gets 300 points
        prisma.ecoPointsTransaction.create({
          data: {
            userId: referrer.id,
            amount: 300,
            type: "referral",
            description: "Бонус за приглашение друга",
          },
        }),
        prisma.user.update({
          where: { id: referrer.id },
          data: { ecoPointsBalance: { increment: 300 } },
        }),
      ]);
    }

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
