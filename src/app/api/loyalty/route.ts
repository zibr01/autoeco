import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// Уровни EcoPoints
const LEVELS = [
  { name: "bronze", min: 0, label: "Бронза", discount: 0 },
  { name: "silver", min: 500, label: "Серебро", discount: 3 },
  { name: "gold", min: 2000, label: "Золото", discount: 5 },
  { name: "platinum", min: 5000, label: "Платина", discount: 10 },
];

// Сколько баллов дают за действия
const POINT_RULES = {
  booking: 50,
  review: 30,
  car_added: 20,
  maintenance: 15,
  daily_login: 5,
  referral: 100,
};

function getLevel(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(points: number) {
  for (const level of LEVELS) {
    if (points < level.min) return level;
  }
  return null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { ecoPointsBalance: true, ecoLevel: true },
  });

  const transactions = await prisma.ecoPointsTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const balance = dbUser?.ecoPointsBalance ?? 0;
  const currentLevel = getLevel(balance);
  const nextLevel = getNextLevel(balance);

  return NextResponse.json({
    balance,
    level: currentLevel,
    nextLevel,
    pointsToNext: nextLevel ? nextLevel.min - balance : 0,
    progress: nextLevel ? ((balance - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100,
    transactions,
    rules: POINT_RULES,
    levels: LEVELS,
  });
}

// POST — начислить баллы (внутренний вызов)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { type, description } = await req.json();
    const amount = POINT_RULES[type as keyof typeof POINT_RULES];

    if (!amount) {
      return NextResponse.json({ error: "Неизвестный тип действия" }, { status: 400 });
    }

    // Создаём транзакцию и обновляем баланс
    const [transaction] = await prisma.$transaction([
      prisma.ecoPointsTransaction.create({
        data: {
          userId: user.id,
          amount,
          type,
          description: description || `Начисление за ${type}`,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          ecoPointsBalance: { increment: amount },
          ecoLevel: getLevel((await prisma.user.findUnique({ where: { id: user.id }, select: { ecoPointsBalance: true } }))!.ecoPointsBalance + amount).name,
        },
      }),
    ]);

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка начисления баллов" }, { status: 500 });
  }
}
