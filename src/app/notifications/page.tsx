"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  Bell, CalendarCheck, X as XIcon, MessageSquare, AlertTriangle,
  Clock, Star, Ticket, CheckCheck, Loader2,
} from "lucide-react";

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

function getNotifIcon(type: string, urgency?: string | null) {
  switch (type) {
    case "booking_confirmed": return { Icon: CalendarCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" };
    case "booking_cancelled": return { Icon: XIcon, color: "text-red-400", bg: "bg-red-400/10" };
    case "booking_created": return { Icon: CalendarCheck, color: "text-brand", bg: "bg-brand/10" };
    case "review_reply": return { Icon: MessageSquare, color: "text-brand-light", bg: "bg-brand/10" };
    case "review_received": return { Icon: Star, color: "text-accent", bg: "bg-accent/10" };
    case "promo_new": return { Icon: Ticket, color: "text-accent", bg: "bg-accent/10" };
    case "reminder_due":
      if (urgency === "high") return { Icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" };
      if (urgency === "medium") return { Icon: Clock, color: "text-accent", bg: "bg-accent/10" };
      return { Icon: Clock, color: "text-[var(--text-muted)]", bg: "bg-[var(--hover-bg)]" };
    default: return { Icon: Bell, color: "text-[var(--text-muted)]", bg: "bg-[var(--hover-bg)]" };
  }
}

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Сегодня", items: [] },
    { label: "Вчера", items: [] },
    { label: "Ранее", items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() >= today.getTime()) {
      groups[0].items.push(n);
    } else if (d.getTime() >= yesterday.getTime()) {
      groups[1].items.push(n);
    } else {
      groups[2].items.push(n);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
          if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.link) router.push(n.link);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </AppLayout>
    );
  }

  const groups = groupByDate(notifications);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">Уведомления</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-text-muted mt-1">{unreadCount} непрочитанных</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-ghost text-sm flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Прочитать все
            </button>
          )}
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="card-surface text-center py-16">
            <Bell className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-muted text-lg font-medium">Нет уведомлений</p>
            <p className="text-text-dim text-sm mt-1">
              Здесь будут появляться уведомления о записях, отзывах и напоминаниях
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3 px-1">
                  {group.label}
                </h3>
                <div className="card-surface !p-0 overflow-hidden divide-y divide-[var(--divider)]">
                  {group.items.map((n) => {
                    const { Icon, color, bg } = getNotifIcon(n.type, n.urgency);
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`w-full text-left px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors flex gap-4 items-start ${
                          !n.read ? "bg-brand/[0.02]" : ""
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!n.read ? "font-semibold text-text" : "font-medium text-text-muted"}`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <div className="w-2.5 h-2.5 bg-brand rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-text-muted mt-0.5">{n.message}</p>
                          <p className="text-xs text-text-dim mt-1.5">
                            {new Date(n.createdAt).toLocaleDateString("ru", {
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
