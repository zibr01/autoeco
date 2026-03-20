"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  Ticket,
  BarChart3,
  Users,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/business", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/business/bookings", icon: CalendarCheck, label: "Записи" },
  { href: "/business/schedule", icon: Clock, label: "Расписание" },
  { href: "/business/reviews", icon: Star, label: "Отзывы" },
  { href: "/business/promos", icon: Ticket, label: "Промокоды" },
  { href: "/business/messages", icon: MessageSquare, label: "Сообщения" },
  { href: "/business/analytics", icon: BarChart3, label: "Аналитика" },
  { href: "/business/clients", icon: Users, label: "Клиенты" },
  { href: "/business/settings", icon: Settings, label: "Настройки" },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "BUSINESS") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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

  const sidebarContent = (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/business" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-prussian flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-text">
            Auto<span className="text-gradient-brand">Eco</span>
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-prussian/[0.04] transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-text" /> : <Menu className="w-5 h-5 text-text" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 w-72 h-full bg-card border-r border-border flex flex-col z-50 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed h-full z-20">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 pt-16 md:pt-0 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
