import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

const ALLOWED_ROLES = ["MODERATOR", "ADMIN"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const services = await prisma.serviceCenter.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      typeName: true,
      address: true,
      district: true,
      city: true,
      phone: true,
      hours: true,
      description: true,
      verified: true,
      featured: true,
      rating: true,
      reviewCount: true,
      ownerId: true,
    },
  });

  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const data = await req.json();

  if (!data.name || !data.address || !data.type) {
    return NextResponse.json(
      { error: "Название, адрес и тип обязательны" },
      { status: 400 }
    );
  }

  const typeNames: Record<string, string> = {
    sto: "СТО",
    wash: "Автомойка",
    tires: "Шиномонтаж",
    detailing: "Детейлинг",
    master: "Автомастер",
    electric: "Автоэлектрик",
    parts: "Запчасти",
  };

  const service = await prisma.serviceCenter.create({
    data: {
      name: data.name,
      type: data.type,
      typeName: typeNames[data.type] || data.type,
      address: data.address,
      district: data.district || "",
      city: data.city || "Самара",
      phone: data.phone || "",
      hours: data.hours || "",
      description: data.description || "",
      image: data.image || "",
      tags: data.tags || "[]",
      services: data.services || "[]",
      photos: data.photos || "[]",
      rating: 0,
      reviewCount: 0,
      priceFrom: data.priceFrom ? Number(data.priceFrom) : 0,
      verified: false,
      featured: false,
    },
  });

  return NextResponse.json(service, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const data = await req.json();

  if (!data.id) {
    return NextResponse.json(
      { error: "ID сервиса обязателен" },
      { status: 400 }
    );
  }

  const existing = await prisma.serviceCenter.findUnique({
    where: { id: data.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Сервис не найден" },
      { status: 404 }
    );
  }

  const allowedFields = [
    "name",
    "address",
    "phone",
    "hours",
    "description",
    "verified",
    "featured",
    "type",
    "typeName",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Нет полей для обновления" },
      { status: 400 }
    );
  }

  const updated = await prisma.serviceCenter.update({
    where: { id: data.id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID сервиса обязателен" },
      { status: 400 }
    );
  }

  const existing = await prisma.serviceCenter.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Сервис не найден" },
      { status: 404 }
    );
  }

  await prisma.serviceCenter.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
