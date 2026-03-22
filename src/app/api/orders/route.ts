import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET — list user's orders
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// POST — create order from cart
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json();
  const { items, name, phone, email, address, comment } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  if (!name || !phone || !address) {
    return NextResponse.json({ error: "Имя, телефон и адрес обязательны" }, { status: 400 });
  }

  if (items.length > 50) {
    return NextResponse.json({ error: "Максимум 50 товаров в заказе" }, { status: 400 });
  }

  // Batch fetch all part offers (fixes N+1)
  const offerIds = items.map((item: { partOfferId: string }) => item.partOfferId);
  const offers = await prisma.partOffer.findMany({
    where: { id: { in: offerIds } },
    include: { part: { select: { name: true } } },
  });

  const offerMap = new Map(offers.map((o) => [o.id, o]));

  let totalPrice = 0;
  const orderItems: {
    partOfferId: string;
    partName: string;
    seller: string;
    brand: string;
    partNumber: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const offer = offerMap.get(item.partOfferId);

    if (!offer) {
      return NextResponse.json({ error: `Товар не найден: ${item.partOfferId}` }, { status: 400 });
    }

    const qty = Math.max(1, item.quantity || 1);
    totalPrice += offer.price * qty;

    orderItems.push({
      partOfferId: offer.id,
      partName: offer.part.name,
      seller: offer.seller,
      brand: offer.brand,
      partNumber: offer.partNumber,
      price: offer.price,
      quantity: qty,
    });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalPrice,
      name,
      phone,
      email: email || user.email,
      address,
      comment: comment || null,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
