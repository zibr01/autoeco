import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── In-memory rate limiter (per-IP, resets on cold start) ───
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

// Clean up stale entries every 5 minutes
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

  // Rate limit auth endpoints: 10 requests per minute
  if (pathname.startsWith("/api/auth/") && !pathname.includes("session")) {
    if (isRateLimited(`auth:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Слишком много попыток. Подождите минуту." },
        { status: 429 }
      );
    }
  }

  // Rate limit API endpoints: 60 requests per minute
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(`api:${ip}`, 60, 60_000)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Подождите." },
        { status: 429 }
      );
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
