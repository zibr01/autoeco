"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield,
  BarChart3,
  Users,
  CreditCard,
  MessageSquare,
  Building2,
  Star,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Обзор", icon: BarChart3 },
  { href: "/admin#users", label: "Пользователи", icon: Users },
  { href: "/admin#subscriptions", label: "Подписки", icon: CreditCard },
  { href: "/admin#feedback", label: "Обратная связь", icon: MessageSquare },
  { href: "/moderator", label: "Сервисы", icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-bg/80 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 h-full border-r border-white/5 bg-bg">
            <div className="flex items-center justify-end p-4">
              <button onClick={() => setSidebarOpen(false)} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top bar — mobile */}
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-white/5 bg-bg/80 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-text-muted" aria-label="Открыть меню">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-light" />
            <span className="font-bold text-text">AutoEco Admin</span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/admin" className="flex items-center gap-2.5 group" onClick={onNavigate}>
          <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-light" />
          </div>
          <div>
            <div className="font-bold text-text text-sm leading-tight">AutoEco</div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href.split("#")[0]) && item.href !== "/admin";
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand/15 text-brand-light"
                  : "text-text-muted hover:text-text hover:bg-white/5"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/panel" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Выйти
        </button>
      </div>
    </>
  );
}
