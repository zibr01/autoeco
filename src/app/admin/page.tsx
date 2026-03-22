"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/Toast";
import {
  Shield,
  Users,
  CreditCard,
  BarChart3,
  Search,
  Loader2,
  Crown,
  UserCheck,
  CalendarCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  ChevronDown,
  MessageSquare,
  Check,
  Trash2,
  Mail,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stats {
  totalUsers: number;
  totalBusinesses: number;
  totalServices: number;
  totalBookings: number;
  totalReviews: number;
  verifiedServices: number;
  unverifiedServices: number;
  newUsersThisMonth: number;
  newBookingsThisMonth: number;
}

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  subscription: string;
  _count: { cars: number; bookings: number };
}

interface SubRequest {
  id: string;
  userId: string;
  user: { name: string | null; email: string | null };
  status: string;
  createdAt: string;
}

interface FeedbackItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

type Tab = "overview" | "users" | "subscriptions" | "feedback";

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [pageReady, setPageReady] = useState(false);

  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated" && isAdmin) {
      setPageReady(true);
    }
  }, [status, isAdmin, router]);

  if (!pageReady || status === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Обзор", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "users", label: "Пользователи", icon: <Users className="w-4 h-4" /> },
    { key: "subscriptions", label: "Подписки", icon: <CreditCard className="w-4 h-4" /> },
    { key: "feedback", label: "Обратная связь", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-brand-light" />
          <h1 className="text-2xl font-bold text-text">Панель администратора</h1>
        </div>
        <p className="text-text-muted text-sm">Управление платформой AutoEco</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === t.key
                ? "bg-brand/20 text-brand-light border border-brand/30"
                : "glass text-text-muted hover:text-text"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "users" && <UsersTab toast={toast} />}
      {activeTab === "subscriptions" && <SubscriptionsTab toast={toast} />}
      {activeTab === "feedback" && <FeedbackTab toast={toast} />}
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Overview                                                   */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <p className="text-text-muted text-sm">Не удалось загрузить статистику</p>
      </div>
    );
  }

  const cards: { label: string; value: number; icon: React.ReactNode; color: string }[] = [
    { label: "Пользователей", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "text-brand-light" },
    { label: "Бизнесов", value: stats.totalBusinesses, icon: <Building2 className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Сервисов", value: stats.totalServices, icon: <Building2 className="w-5 h-5" />, color: "text-cyan-400" },
    { label: "Бронирований", value: stats.totalBookings, icon: <CalendarCheck className="w-5 h-5" />, color: "text-amber-400" },
    { label: "Отзывов", value: stats.totalReviews, icon: <Star className="w-5 h-5" />, color: "text-yellow-400" },
    { label: "Верифицированных", value: stats.verifiedServices, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400" },
    { label: "Неверифицированных", value: stats.unverifiedServices, icon: <AlertCircle className="w-5 h-5" />, color: "text-red-400" },
    { label: "Новых за месяц", value: stats.newUsersThisMonth, icon: <UserCheck className="w-5 h-5" />, color: "text-teal-400" },
    { label: "Брони за месяц", value: stats.newBookingsThisMonth, icon: <TrendingUp className="w-5 h-5" />, color: "text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="glass rounded-xl p-4 text-center">
          <div className={`${c.color} mx-auto mb-1`}>{c.icon}</div>
          <div className="text-2xl font-bold text-text">{c.value}</div>
          <div className="text-xs text-text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Users                                                      */
/* ------------------------------------------------------------------ */

function UsersTab({ toast }: { toast: (msg: string) => void }) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const TAKE = 20;

  const fetchUsers = useCallback(
    async (skipVal: number, searchVal: string, append: boolean) => {
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const params = new URLSearchParams({ take: String(TAKE), skip: String(skipVal) });
        if (searchVal) params.set("search", searchVal);
        const res = await fetch(`/api/admin/users?${params}`);
        const data = await res.json();
        const list: UserItem[] = Array.isArray(data) ? data : data.users ?? [];
        if (append) {
          setUsers((prev) => [...prev, ...list]);
        } else {
          setUsers(list);
        }
        setHasMore(list.length === TAKE);
        setSkip(skipVal + list.length);
      } catch {
        toast("Ошибка загрузки пользователей");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchUsers(0, "", false);
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    fetchUsers(0, searchInput, false);
  };

  const handleLoadMore = () => {
    fetchUsers(skip, search, true);
  };

  const patchUser = async (userId: string, body: Record<string, string>) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...body }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: updated.role ?? u.role, subscription: updated.subscription ?? u.subscription }
            : u,
        ),
      );
      toast("Пользователь обновлён");
    } catch {
      toast("Ошибка обновления");
    } finally {
      setActionLoading(null);
    }
  };

  const roleOptions = ["USER", "BUSINESS", "MODERATOR", "ADMIN"];

  return (
    <div>
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Поиск по имени или email..."
            className="input-field text-sm pl-9 w-full"
          />
        </div>
        <button onClick={handleSearch} className="btn-primary text-sm !py-2 flex items-center gap-1.5">
          <Search className="w-4 h-4" />
          Найти
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <Users className="w-6 h-6 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const busy = actionLoading === u.id;
            return (
              <div key={u.id} className="card-surface">
                <div className="flex items-start gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-brand-light" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text text-sm truncate">
                        {u.name || "Без имени"}
                      </span>
                      <span className="tag text-[10px]">{u.role}</span>
                      {u.subscription === "PREMIUM" && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                          <Crown className="w-3 h-3" /> Premium
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5 truncate">{u.email}</div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span>Авто: {u._count.cars}</span>
                      <span>Брони: {u._count.bookings}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {busy && <Loader2 className="w-4 h-4 text-brand animate-spin" />}

                    {/* Role selector */}
                    <div className="relative">
                      <select
                        value={u.role}
                        disabled={busy}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        className="input-field text-xs !py-1.5 !pr-7 appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                    </div>

                    {/* Subscription toggle */}
                    <button
                      disabled={busy}
                      onClick={() =>
                        patchUser(u.id, {
                          subscription: u.subscription === "PREMIUM" ? "FREE" : "PREMIUM",
                        })
                      }
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50 ${
                        u.subscription === "PREMIUM"
                          ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                          : "bg-gray-500/20 text-text-muted hover:bg-gray-500/30"
                      }`}
                    >
                      {u.subscription === "PREMIUM" ? "Premium" : "Free"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && users.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-primary text-sm !py-2 flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Загрузить ещё"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Subscriptions                                              */
/* ------------------------------------------------------------------ */

function SubscriptionsTab({ toast }: { toast: (msg: string) => void }) {
  const [requests, setRequests] = useState<SubRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/subscriptions")
      .then((r) => r.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const activate = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: "PREMIUM" }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
      toast("Premium активирован");
    } catch {
      toast("Ошибка активации");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <CreditCard className="w-6 h-6 text-text-muted mx-auto mb-2" />
        <p className="text-text-muted text-sm">Нет ожидающих запросов</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((req) => {
        const busy = actionLoading === req.userId;
        return (
          <div key={req.id} className="card-surface flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-text text-sm truncate">
                {req.user.name || "Без имени"}
              </div>
              <div className="text-xs text-text-muted truncate">{req.user.email}</div>
              <div className="text-xs text-text-muted mt-0.5">
                Заявка от {new Date(req.createdAt).toLocaleDateString("ru-RU")}
              </div>
            </div>
            <button
              onClick={() => activate(req.userId)}
              disabled={busy}
              className="btn-primary text-xs !py-2 flex items-center gap-1.5 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Crown className="w-3.5 h-3.5" />
              )}
              Активировать Premium
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4 — Feedback                                                   */
/* ------------------------------------------------------------------ */

function FeedbackTab({ toast }: { toast: (msg: string) => void }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const TAKE = 20;

  const fetchFeedback = useCallback(
    async (skipVal: number, append: boolean) => {
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const params = new URLSearchParams({ take: String(TAKE), skip: String(skipVal) });
        const res = await fetch(`/api/admin/feedback?${params}`);
        const data = await res.json();
        const list: FeedbackItem[] = data.items ?? [];
        if (append) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }
        setTotal(data.total ?? 0);
        setUnread(data.unread ?? 0);
        setHasMore(list.length === TAKE);
        setSkip(skipVal + list.length);
      } catch {
        toast("Ошибка загрузки обратной связи");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchFeedback(0, false);
  }, [fetchFeedback]);

  const markAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnread((prev) => Math.max(0, prev - 1));
      toast("Отмечено как прочитанное");
    } catch {
      toast("Ошибка обновления");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm("Удалить это сообщение?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const wasUnread = items.find((item) => item.id === id && !item.read);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
      if (wasUnread) setUnread((prev) => Math.max(0, prev - 1));
      toast("Сообщение удалено");
    } catch {
      toast("Ошибка удаления");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-4">
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-muted">Всего:</span>
          <span className="text-sm font-semibold text-text">{total}</span>
        </div>
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-light" />
          <span className="text-sm text-text-muted">Непрочитанных:</span>
          <span className="text-sm font-semibold text-brand-light">{unread}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <MessageSquare className="w-6 h-6 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">Нет сообщений обратной связи</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const busy = actionLoading === item.id;
            return (
              <div key={item.id} className="card-surface">
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/20 flex-shrink-0 relative">
                    <MessageSquare className="w-5 h-5 text-brand-light" />
                    {!item.read && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[var(--bg)]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text text-sm">{item.title}</span>
                      {!item.read && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-medium">
                          Новое
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mt-1 break-words">{item.message}</p>
                    <div className="text-xs text-text-muted mt-1.5">
                      {new Date(item.createdAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {busy && <Loader2 className="w-4 h-4 text-brand animate-spin" />}
                    {!item.read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        disabled={busy}
                        title="Прочитано"
                        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteFeedback(item.id)}
                      disabled={busy}
                      title="Удалить"
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && items.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => fetchFeedback(skip, true)}
            disabled={loadingMore}
            className="btn-primary text-sm !py-2 flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Загрузить ещё"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
