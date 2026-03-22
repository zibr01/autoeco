import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get("take")) || 20, 50);
    const skip = Number(searchParams.get("skip")) || 0;

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = searchParams.get("page");

    // Build where filter
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (page) where.page = { contains: page, mode: "insensitive" };

    // Build orderBy
    let orderBy: Record<string, string>;
    if (sortBy === "messageLength") {
      // Prisma doesn't support ordering by computed field directly,
      // fall back to createdAt and we'll sort in-memory below
      orderBy = { createdAt: sortOrder };
    } else if (["createdAt", "page", "userName"].includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [items, total, statsNew, statsInProgress, statsFixed, statsNotImportant] =
      await Promise.all([
        prisma.feedback.findMany({
          where,
          orderBy,
          take,
          skip,
          select: {
            id: true,
            userId: true,
            userName: true,
            userEmail: true,
            page: true,
            message: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.feedback.count({ where }),
        prisma.feedback.count({ where: { ...where, status: "new" } }),
        prisma.feedback.count({ where: { ...where, status: "in_progress" } }),
        prisma.feedback.count({ where: { ...where, status: "fixed" } }),
        prisma.feedback.count({ where: { ...where, status: "not_important" } }),
      ]);

    // Handle messageLength sorting in-memory
    let sortedItems = items;
    if (sortBy === "messageLength") {
      sortedItems = [...items].sort((a, b) => {
        const diff = a.message.length - b.message.length;
        return sortOrder === "asc" ? diff : -diff;
      });
    }

    return NextResponse.json({
      items: sortedItems,
      total,
      stats: {
        new: statsNew,
        in_progress: statsInProgress,
        fixed: statsFixed,
        not_important: statsNotImportant,
      },
    });
  } catch (error) {
    console.error("Admin feedback GET error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const { id, status, priority } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 });
    }

    const validStatuses = ["new", "in_progress", "fixed", "not_important"];
    const validPriorities = ["urgent", "monthly", "future"];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
    }
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Недопустимый приоритет" }, { status: 400 });
    }

    const data: Record<string, string> = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data,
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Admin feedback PATCH error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 });
    }

    await prisma.feedback.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin feedback DELETE error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
