import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/** Fast auth check — uses JWT claims, no DB query */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email || "",
    role: session.user.role || "USER",
    subscription: session.user.subscription || "FREE",
  };
}

/** Full user profile — hits DB for fresh data */
export async function getCurrentUserFull() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      image: true,
      subscription: true,
      createdAt: true,
    },
  });
}
