"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Car, ChevronDown, Menu, User, X, LogOut, Settings, LayoutDashboard, Sun, Moon, Building2, AlertTriangle, Clock, CalendarCheck, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Notification {
  id: string;
  type: "reminder" | "booking" | "maintenance";
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  date: string;
  read: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Дашборд" },
  { href: "/garage", label: "Гараж" },
  { href: "/services", label: "Сервисы" },
  { href: "/diagnostics", label: "Диагностика" },
  { href: "/parts", label: "Запчасти" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Fetch notifications
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
          if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    }
  }, [status]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isAuth = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuth ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-prussian flex items-center justify-center group-hover:shadow-brand transition-shadow">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-prussian">
              Auto<span className="text-gradient-brand">Eco</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuth && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive
                        ? "px-3.5 py-2 rounded-lg text-sm font-medium text-brand bg-brand/[0.06] border border-brand/[0.1]"
                        : "px-3.5 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
              aria-label="Переключить тему"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-[var(--text-muted)]" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--text-muted)]" />
              )}
            </button>

            {isAuth ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-accent text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[var(--divider)] flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--text)]">Уведомления</span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} новых
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                            Нет уведомлений
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const NotifIcon =
                              n.type === "reminder"
                                ? n.urgency === "high" ? AlertTriangle : Clock
                                : n.type === "booking"
                                ? CalendarCheck
                                : CheckCircle2;
                            const iconColor =
                              n.urgency === "high"
                                ? "text-red-400"
                                : n.urgency === "medium"
                                ? "text-accent"
                                : "text-[var(--text-muted)]";
                            return (
                              <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-[var(--divider)] last:border-b-0 hover:bg-[var(--hover-bg)] transition-colors ${
                                  !n.read ? "bg-brand/[0.03]" : ""
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                                    <NotifIcon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[var(--text)] truncate">{n.title}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{n.description}</p>
                                    <p className="text-[10px] text-[var(--text-dim)] mt-1">
                                      {new Date(n.date).toLocaleDateString("ru", { day: "numeric", month: "short" })}
                                    </p>
                                  </div>
                                  {!n.read && (
                                    <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1.5" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ghost-bg)] border border-[var(--border)] hover:bg-[var(--hover-bg-medium)] transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--text-muted)]">
                      {session?.user?.name || "Пользователь"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-dim)] hidden sm:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 py-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-lg z-50">
                      <div className="px-4 py-2 border-b border-[var(--divider)] mb-1">
                        <p className="text-sm font-medium text-[var(--text)]">{session?.user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{session?.user?.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Дашборд
                      </Link>
                      {session?.user?.role === "BUSINESS" && (
                        <Link
                          href="/business"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-light hover:text-brand hover:bg-brand/[0.04] transition-all"
                        >
                          <Building2 className="w-4 h-4" />
                          B2B Кабинет
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        Настройки
                      </Link>

                      <div className="border-t border-[var(--divider)] mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Выйти
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/register-business"
                  className="hidden sm:block px-3 py-2 rounded-lg text-xs font-medium text-brand-light hover:text-brand hover:bg-brand/[0.04] transition-all"
                >
                  Для бизнеса
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm !py-2 !px-4"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            {isAuth && (
              <button
                className="md:hidden p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Меню"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-[var(--text)]" />
                ) : (
                  <Menu className="w-5 h-5 text-[var(--text)]" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isAuth && mobileOpen && (
        <nav className="md:hidden border-t border-[var(--divider)]">
          <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    isActive
                      ? "px-4 py-3 rounded-lg text-sm font-medium text-brand bg-brand/[0.06]"
                      : "px-4 py-3 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
