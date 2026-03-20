import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";
import { createNotification } from "@/lib/notifications";

async function verifyReviewOwnership(reviewId: string, serviceCenterId: string) {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, serviceCenterId },
  });
  return !!review;
}

export async function POST(req: Request) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { reviewId, text } = await req.json();

  if (!await verifyReviewOwnership(reviewId, sc.id)) {
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, serviceCenterId: true },
  });

  const reply = await prisma.reviewReply.create({
    data: { reviewId, text },
  });

  if (review?.userId) {
    await createNotification({
      userId: review.userId,
      type: "review_reply",
      title: "Ответ на ваш отзыв",
      message: `${sc.name} ответил на ваш отзыв`,
      link: `/services/${review.serviceCenterId}`,
    });
  }

  return NextResponse.json(reply, { status: 201 });
}

export async function PUT(req: Request) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { reviewId, text } = await req.json();

  if (!await verifyReviewOwnership(reviewId, sc.id)) {
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }

  const reply = await prisma.reviewReply.update({
    where: { reviewId },
    data: { text },
  });

  return NextResponse.json(reply);
}

export async function DELETE(req: Request) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const { reviewId } = await req.json();

  if (!await verifyReviewOwnership(reviewId, sc.id)) {
    return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
  }

  await prisma.reviewReply.delete({
    where: { reviewId },
  });

  return NextResponse.json({ success: true });
}
