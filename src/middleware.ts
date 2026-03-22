import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Platform routing ───
type Platform = "client" | "business" | "admin";

function getPlatform(): Platform {
  const p = process.env.NEXT_PUBLIC_PLATFORM;
  if (p === "business" || p === "admin") return p;
  return "client";
}

// Route prefixes allowed per platform (pages only, not API)
const allowedPrefixes: Record<Platform, string[]> = {
  client: [
    "/auth/login", "/auth/register",
    "/dashboard", "/garage", "/services", "/parts", "/diagnostics",
    "/messages", "/profile", "/loyalty", "/subscription",
    "/notifications", "/favorites", "/checkout", "/orders",
    "/compare", "/partners", "/invite",
  ],
  business: [
    "/auth/login", "/auth/register-business",
    "/business", "/messages", "/profile", "/notifications",
  ],
  admin: [
    "/auth/login",
    "/admin", "/moderator", "/profile", "/notifications",
  ],
};

function isRouteAllowed(pathname: string, platform: Platform): boolean {
  // Root page is always allowed
  if (pathname === "/") return true;
  // API routes are always allowed (auth checked server-side)
  if (pathname.startsWith("/api/")) return true;

  const prefixes = allowedPrefixes[platform];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

// ─── In-memory rate limiter ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((val, key) => {
    if (now > val.resetAt) rateLimitMap.delete(key);
  });
}, 5 * 60 * 1000);

// ─── Security headers ───
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const platform = getPlatform();

  // ─── Platform route restriction ───
  if (!isRouteAllowed(pathname, platform)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ─── Rate limiting ───
  if (pathname.startsWith("/api/auth/") && !pathname.includes("session")) {
    if (isRateLimited(`auth:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Слишком много попыток. Подождите минуту." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/api/")) {
    if (isRateLimited(`api:${ip}`, 60, 60_000)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Подождите." },
        { status: 429 }
      );
    }
  }

  // ─── Security headers ───
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
