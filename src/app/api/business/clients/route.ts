import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessServiceCenter } from "@/lib/business-helpers";

export async function GET(req: NextRequest) {
  const sc = await getBusinessServiceCenter();
  if (!sc) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search") || "";

  // Get bookings for this service center (last 2000, enough for client aggregation)
  const bookings = await prisma.booking.findMany({
    where: { serviceCenterId: sc.id },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, city: true, createdAt: true } },
      car: { select: { make: true, model: true, year: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  // Aggregate by client
  const clientMap = new Map<string, {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    city: string | null;
    registeredAt: string;
    totalVisits: number;
    completedVisits: number;
    cancelledVisits: number;
    lastVisit: string;
    firstVisit: string;
    cars: string[];
    recentServices: string[];
  }>();

  for (const b of bookings) {
    const carName = `${b.car.make} ${b.car.model} ${b.car.year}`;
    const existing = clientMap.get(b.userId);

    if (existing) {
      existing.totalVisits++;
      if (b.status === "completed") existing.completedVisits++;
      if (b.status === "cancelled") existing.cancelledVisits++;
      if (b.createdAt.toISOString() > existing.lastVisit) existing.lastVisit = b.createdAt.toISOString();
      if (b.createdAt.toISOString() < existing.firstVisit) existing.firstVisit = b.createdAt.toISOString();
      if (!existing.cars.includes(carName)) existing.cars.push(carName);
      if (!existing.recentServices.includes(b.serviceType) && existing.recentServices.length < 3) {
        existing.recentServices.push(b.serviceType);
      }
    } else {
      clientMap.set(b.userId, {
        id: b.userId,
        name: b.user.name || "Клиент",
        phone: b.user.phone,
        email: b.user.email,
        city: b.user.city,
        registeredAt: b.user.createdAt.toISOString(),
        totalVisits: 1,
        completedVisits: b.status === "completed" ? 1 : 0,
        cancelledVisits: b.status === "cancelled" ? 1 : 0,
        lastVisit: b.createdAt.toISOString(),
        firstVisit: b.createdAt.toISOString(),
        cars: [carName],
        recentServices: [b.serviceType],
      });
    }
  }

  let clients = Array.from(clientMap.values());

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        c.cars.some((car) => car.toLowerCase().includes(q))
    );
  }

  // Sort by total visits descending
  clients.sort((a, b) => b.totalVisits - a.totalVisits);

  return NextResponse.json({
    clients,
    total: clients.length,
  });
}
