import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    VERCEL_URL: process.env.VERCEL_URL || "not set",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
    db: false as boolean | string,
  };

  try {
    const count = await prisma.user.count();
    checks.db = `connected (${count} users)`;
  } catch (e: unknown) {
    checks.db = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  return NextResponse.json(checks);
}
