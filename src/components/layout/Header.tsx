"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Car, ChevronDown, Menu, User, X, LogOut, Settings, LayoutDashboard, Sun, Moon, Building2, AlertTriangle, Clock, CalendarCheck, Star, MessageSquare, Ticket, CheckCircle2, Award, Crown, Shield } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getPlatform, platformNames, platformHome } from "@/lib/platform";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
  urgency?: string | null;
}

const platform = getPlatform();

const navItemsByPlatform = {
  client: [
    { href: "/dashboard", label: "Гараж" },
    { href: "/services", label: "Сервисы" },
    { href: "/diagnostics", label: "Диагностика" },
    { href: "/parts", label: "Запчасти" },
  ],
  business: [
    { href: "/business/bookings", label: "Записи" },
    { href: "/business/clients", label: "Клиенты" },
    { href: "/business/analytics", label: "Аналитика" },
    { href: "/business/reviews", label: "Отзывы" },
  ],
  admin: [
    { href: "/moderator", label: "Модерация" },
    { href: "/admin", label: "Пользователи" },
    { href: "/admin?tab=stats", label: "Статистика" },
  ],
};

const navItems = navItemsByPlatform[platform];

function getNotifIcon(type: string, urgency?: string | null) {
  switch (type) {
    case "booking_confirmed": return { Icon: CalendarCheck, color: "text-emerald-400" };
    case "booking_cancelled": return { Icon: X, color: "text-red-400" };
    case "booking_created": return { Icon: CalendarCheck, color: "text-brand" };
    case "review_reply": return { Icon: MessageSquare, color: "text-brand-light" };
    case "reminder_due":
      if (urgency === "high") return { Icon: AlertTriangle, color: "text-red-400" };
      if (urgency === "medium") return { Icon: Clock, color: "text-accent" };
      return { Icon: Clock, color: "text-[var(--text-muted)]" };
    case "promo_new": return { Icon: Ticket, color: "text-accent" };
    case "review_received": return { Icon: Star, color: "text-accent" };
    default: return { Icon: Bell, color: "text-[var(--text-muted)]" };
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = async (n: Notification) => {
    if (!n.read && !n.id.startsWith("reminder-")) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifOpen(false);
    if (n.link) router.push(n.link);
  };

  const isAuth = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuth ? platformHome[platform] : "/"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-prussian flex items-center justify-center group-hover:shadow-brand transition-shadow">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-prussian">
              Auto<span className="text-gradient-brand">Eco</span>
              {platform !== "client" && (
                <span className="text-xs font-medium text-[var(--text-muted)] ml-1">
                  {platform === "business" ? "Business" : "Admin"}
                </span>
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuth && (
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Основная навигация">
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
                    aria-label="Уведомления"
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
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[10px] text-brand hover:text-brand-light transition-colors"
                            >
                              Прочитать все
                            </button>
                          )}
                          {unreadCount > 0 && (
                            <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                            Нет уведомлений
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => {
                            const { Icon, color } = getNotifIcon(n.type, n.urgency);
                            return (
                              <button
                                key={n.id}
                                onClick={() => handleNotifClick(n)}
                                className={`w-full text-left px-4 py-3 border-b border-[var(--divider)] last:border-b-0 hover:bg-[var(--hover-bg)] transition-colors ${
                                  !n.read ? "bg-brand/[0.03]" : ""
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[var(--text)] truncate">{n.title}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-[var(--text-dim)] mt-1">
                                      {new Date(n.createdAt).toLocaleDateString("ru", { day: "numeric", month: "short" })}
                                    </p>
                                  </div>
                                  {!n.read && (
                                    <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1.5" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-2.5 text-center text-xs font-medium text-brand hover:bg-brand/[0.04] border-t border-[var(--divider)] transition-colors"
                      >
                        Все уведомления
                      </Link>
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ghost-bg)] border border-[var(--border)] hover:bg-[var(--hover-bg-medium)] transition-all"
                    aria-label="Меню пользователя"
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

                      {/* Platform-based menu items */}
                      {platform === "client" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Дашборд
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                          >
                            <Settings className="w-4 h-4" />
                            Профиль
                          </Link>
                          <Link
                            href="/loyalty"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:text-accent-dark hover:bg-accent/[0.04] transition-all"
                          >
                            <Award className="w-4 h-4" />
                            EcoPoints
                          </Link>
                          <Link
                            href="/subscription"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                          >
                            <Crown className="w-4 h-4" />
                            Подписка
                          </Link>
                        </>
                      )}
                      {platform === "business" && (
                        <>
                          <Link
                            href="/business"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-light hover:text-brand hover:bg-brand/[0.04] transition-all"
                          >
                            <Building2 className="w-4 h-4" />
                            B2B Кабинет
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                          >
                            <Settings className="w-4 h-4" />
                            Профиль
                          </Link>
                          <Link
                            href="/business/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                          >
                            <Settings className="w-4 h-4" />
                            Настройки
                          </Link>
                        </>
                      )}
                      {platform === "admin" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.04] transition-all"
                          >
                            <Shield className="w-4 h-4" />
                            Админ-панель
                          </Link>
                          <Link
                            href="/moderator"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/[0.04] transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Модерация
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] transition-all"
                          >
                            <Settings className="w-4 h-4" />
                            Профиль
                          </Link>
                        </>
                      )}

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

          </div>
        </div>
      </div>
    </header>
  );
}
