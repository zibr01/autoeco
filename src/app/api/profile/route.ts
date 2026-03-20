import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import crypto from "crypto";

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  // Generate referral code if missing
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { referralCode: true },
  });
  if (!existingUser?.referralCode) {
    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.user.findUnique({ where: { referralCode: code } });
      if (!exists) break;
      code = generateReferralCode();
      attempts++;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode: code },
    });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      image: true,
      subscription: true,
      referralCode: true,
      ecoPointsBalance: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          cars: true,
          bookings: true,
          reviews: true,
          referrals: true,
        },
      },
    },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const data = await req.json();

  // Only allow updating safe fields
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      phone: data.phone,
      city: data.city,
      image: data.image,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      image: true,
      subscription: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  // Cascade delete handled by Prisma schema (onDelete: Cascade)
  await prisma.user.delete({
    where: { id: user.id },
  });

  return NextResponse.json({ success: true });
}
