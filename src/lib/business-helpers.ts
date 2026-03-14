import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getBusinessUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") return null;
  return session.user;
}

export async function getBusinessServiceCenter() {
  const user = await getBusinessUser();
  if (!user) return null;

  const serviceCenter = await prisma.serviceCenter.findFirst({
    where: { ownerId: user.id },
  });

  return serviceCenter;
}
