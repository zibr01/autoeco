import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET — list conversations or messages for a specific conversation
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const withUserId = req.nextUrl.searchParams.get("with");

  if (withUserId) {
    // Get messages between current user and another user (last 100)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });
    messages.reverse(); // Return in chronological order

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: withUserId,
        receiverId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(messages);
  }

  // List conversations (grouped by partner, last 500 messages max)
  const allMessages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  // Group by conversation partner
  const conversationMap = new Map<string, {
    partnerId: string;
    partnerName: string;
    partnerRole: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    serviceCenterId: string | null;
  }>();

  for (const msg of allMessages) {
    const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
    const partner = msg.senderId === user.id ? msg.receiver : msg.sender;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        partnerName: partner.name || "Пользователь",
        partnerRole: partner.role,
        lastMessage: msg.text,
        lastMessageAt: msg.createdAt.toISOString(),
        unreadCount: 0,
        serviceCenterId: msg.serviceCenterId,
      });
    }

    // Count unread
    if (msg.receiverId === user.id && !msg.read) {
      const conv = conversationMap.get(partnerId)!;
      conv.unreadCount++;
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return NextResponse.json(conversations);
}

// POST — send message
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { receiverId, text, serviceCenterId, bookingId } = await req.json();

  if (!receiverId || !text?.trim()) {
    return NextResponse.json({ error: "Получатель и текст обязательны" }, { status: 400 });
  }

  if (text.trim().length > 5000) {
    return NextResponse.json({ error: "Сообщение слишком длинное (макс. 5000 символов)" }, { status: 400 });
  }

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: "Получатель не найден" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      text: text.trim(),
      serviceCenterId: serviceCenterId || null,
      bookingId: bookingId || null,
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
