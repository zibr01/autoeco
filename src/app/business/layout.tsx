"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  Building2,
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Star,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/business", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/business/bookings", icon: CalendarCheck, label: "Записи" },
  { href: "/business/schedule", icon: Clock, label: "Расписание" },
  { href: "/business/reviews", icon: Star, label: "Отзывы" },
  { href: "/business/settings", icon: Settings, label: "Настройки" },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "BUSINESS") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "BUSINESS") {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-full z-20">
        <div className="p-5 border-b border-border">
          <Link href="/business" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-prussian flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-text">
                Auto<span className="text-gradient-brand">Eco</span>
              </span>
              <p className="text-[10px] text-text-dim uppercase tracking-widest -mt-0.5">Business</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-text-muted hover:text-text hover:bg-prussian/[0.04]"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-text truncate">{session.user.name}</p>
            <p className="text-xs text-text-dim truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
