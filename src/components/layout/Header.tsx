"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Car, ChevronDown, Menu, User, X, LogOut, Settings, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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
                <button className="relative p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
                  <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                </button>

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
