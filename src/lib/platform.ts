// Platform configuration — determined by NEXT_PUBLIC_PLATFORM env var
// Values: "client" | "business" | "admin"

export type Platform = "client" | "business" | "admin";

export function getPlatform(): Platform {
  const p = process.env.NEXT_PUBLIC_PLATFORM;
  if (p === "business" || p === "admin") return p;
  return "client"; // default
}

// Routes allowed per platform
export const platformRoutes: Record<Platform, string[]> = {
  client: [
    "/",
    "/auth/login",
    "/auth/register",
    "/dashboard",
    "/garage",
    "/services",
    "/parts",
    "/diagnostics",
    "/messages",
    "/profile",
    "/loyalty",
    "/subscription",
    "/notifications",
    "/favorites",
    "/checkout",
    "/orders",
    "/compare",
    "/partners",
    "/invite",
  ],
  business: [
    "/",
    "/auth/login",
    "/auth/register-business",
    "/business",
    "/messages",
    "/profile",
    "/notifications",
  ],
  admin: [
    "/",
    "/auth/login",
    "/admin",
    "/moderator",
    "/profile",
    "/notifications",
  ],
};

// Roles allowed to log in per platform
export const platformRoles: Record<Platform, string[]> = {
  client: ["USER"],
  business: ["BUSINESS"],
  admin: ["ADMIN", "MODERATOR"],
};

// Platform display names
export const platformNames: Record<Platform, string> = {
  client: "AutoEco",
  business: "AutoEco Business",
  admin: "AutoEco Admin",
};

// After-login redirect per platform
export const platformHome: Record<Platform, string> = {
  client: "/dashboard",
  business: "/business",
  admin: "/admin",
};
