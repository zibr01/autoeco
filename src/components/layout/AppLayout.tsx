"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "./Header";
import { MessageCircle, X, Send, Loader2, LayoutDashboard, Wrench, Search, Car, User } from "lucide-react";

const bottomTabs = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Главная" },
  { href: "/services", icon: Wrench, label: "Сервисы" },
  { href: "/diagnostics", icon: Search, label: "AI" },
  { href: "/garage", icon: Car, label: "Гараж" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackText }),
      });
      setFeedbackSent(true);
      setFeedbackText("");
      setTimeout(() => {
        setFeedbackSent(false);
        setFeedbackOpen(false);
      }, 2000);
    } catch {
      // silent
    }
    setFeedbackSending(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Tab Bar — mobile only */}
      {status === "authenticated" && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-dark border-t border-[var(--border)]">
          <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
            {bottomTabs.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? "text-brand"
                      : "text-[var(--text-dim)] active:text-[var(--text)]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand" : ""}`} />
                  <span className={`text-[10px] font-medium ${isActive ? "text-brand" : ""}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Floating feedback button */}
      <div className="fixed bottom-[5.5rem] md:bottom-6 right-4 sm:right-6 z-40">
        {feedbackOpen && (
          <div className="absolute bottom-14 right-0 w-72 sm:w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl p-4 mb-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-text text-sm">Обратная связь</h4>
              <button onClick={() => setFeedbackOpen(false)} className="p-1 rounded-lg hover:bg-[var(--hover-bg)]">
                <X className="w-4 h-4 text-text-dim" />
              </button>
            </div>
            {feedbackSent ? (
              <div className="text-center py-4">
                <div className="text-emerald-400 font-medium text-sm">Спасибо за отзыв!</div>
                <p className="text-text-dim text-xs mt-1">Мы обязательно учтём ваше мнение</p>
              </div>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="input-field text-sm min-h-[80px] resize-none mb-3 w-full"
                  placeholder="Расскажите что нравится, что улучшить..."
                  autoFocus
                />
                <button
                  onClick={handleSendFeedback}
                  disabled={feedbackSending || !feedbackText.trim()}
                  className="btn-primary w-full justify-center text-sm !py-2 disabled:opacity-50"
                >
                  {feedbackSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      Отправить
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setFeedbackOpen(!feedbackOpen)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            feedbackOpen
              ? "bg-brand/80 text-white rotate-90"
              : "bg-brand text-white hover:bg-brand-dark hover:shadow-brand"
          }`}
        >
          {feedbackOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
