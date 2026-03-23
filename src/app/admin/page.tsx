"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
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
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ExternalLink,
  User,
  ArrowUpDown,
  Clock,
  Flame,
  Calendar,
  Filter,
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
  userId: string | null;
  userName: string;
  userEmail: string | null;
  page: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface FeedbackStats {
  new: number;
  in_progress: number;
  fixed: number;
  not_important: number;
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
      router.push("/panel/login");
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
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Обзор", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "users", label: "Пользователи", icon: <Users className="w-4 h-4" /> },
    { key: "subscriptions", label: "Подписки", icon: <CreditCard className="w-4 h-4" /> },
    { key: "feedback", label: "Обратная связь", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
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
    </AdminLayout>
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
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<FeedbackStats>({ new: 0, in_progress: 0, fixed: 0, not_important: 0 });
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const TAKE = 20;

  const statusLabels: Record<string, string> = {
    new: "Новый",
    in_progress: "В работе",
    not_important: "Не важно",
    fixed: "Исправлено",
  };

  const statusColors: Record<string, string> = {
    new: "blue",
    in_progress: "amber",
    not_important: "gray",
    fixed: "emerald",
  };

  const priorityLabels: Record<string, string> = {
    urgent: "Срочно",
    monthly: "В этом месяце",
    future: "На будущее",
  };

  const priorityColors: Record<string, string> = {
    urgent: "red",
    monthly: "amber",
    future: "blue",
  };

  const fetchFeedback = useCallback(
    async (pageVal: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          take: String(TAKE),
          skip: String(pageVal * TAKE),
          sortBy,
          sortOrder,
        });
        if (filterStatus) params.set("status", filterStatus);
        if (filterPriority) params.set("priority", filterPriority);
        const res = await fetch(`/api/admin/feedback?${params}`);
        const data = await res.json();
        const list: FeedbackItem[] = data.items ?? [];
        setItems(list);
        setTotal(data.total ?? 0);
        if (data.stats) setStats(data.stats);
        setPage(pageVal);
      } catch {
        toast("Ошибка загрузки обратной связи");
      } finally {
        setLoading(false);
      }
    },
    [toast, filterStatus, filterPriority, sortBy, sortOrder],
  );

  useEffect(() => {
    fetchFeedback(0);
  }, [fetchFeedback]);

  const patchFeedback = async (id: string, body: { status?: string; priority?: string }) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: updated.status ?? item.status, priority: updated.priority ?? item.priority }
            : item,
        ),
      );
      // Refresh stats
      fetchFeedback(page);
      toast("Обновлено");
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
      toast("Сообщение удалено");
      fetchFeedback(page);
    } catch {
      toast("Ошибка удаления");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / TAKE);

  const getColorClasses = (color: string, active: boolean) => {
    const map: Record<string, { bg: string; text: string; activeBg: string }> = {
      blue: { bg: "bg-blue-500/10", text: "text-blue-400", activeBg: "bg-blue-500/30" },
      amber: { bg: "bg-amber-500/10", text: "text-amber-400", activeBg: "bg-amber-500/30" },
      gray: { bg: "bg-gray-500/10", text: "text-gray-400", activeBg: "bg-gray-500/30" },
      emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", activeBg: "bg-emerald-500/30" },
      red: { bg: "bg-red-500/10", text: "text-red-400", activeBg: "bg-red-500/30" },
    };
    const c = map[color] ?? map.gray;
    return `${active ? c.activeBg : c.bg} ${c.text}`;
  };

  return (
    <div>
      {/* Stats header */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["new", "in_progress", "fixed", "not_important"] as const).map((key) => {
          const color = statusColors[key];
          return (
            <div
              key={key}
              className={`rounded-xl px-3 py-1.5 flex items-center gap-2 ${getColorClasses(color, false)} border border-transparent`}
            >
              <span className="text-xs font-medium">{statusLabels[key]}</span>
              <span className="text-sm font-bold">{stats[key]}</span>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field text-xs !py-1.5 !pr-7 appearance-none cursor-pointer"
          >
            <option value="">Все статусы</option>
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field text-xs !py-1.5 !pr-7 appearance-none cursor-pointer"
          >
            <option value="">Все приоритеты</option>
            {Object.entries(priorityLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>

        {/* Sort by */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-xs !py-1.5 !pr-7 appearance-none cursor-pointer"
          >
            <option value="createdAt">По дате</option>
            <option value="status">По статусу</option>
            <option value="priority">По приоритету</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>

        {/* Sort direction */}
        <button
          onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
          className="p-1.5 rounded-lg glass hover:bg-white/10 transition-all"
          title={sortOrder === "desc" ? "По убыванию" : "По возрастанию"}
        >
          <ArrowUpDown className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <MessageSquare className="w-6 h-6 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">Нет сообщений обратной связи</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const busy = actionLoading === item.id;
            const isExpanded = expandedId === item.id;
            const isLong = item.message.length > 200;

            return (
              <div key={item.id} className="card-surface">
                {/* Header: user info + page badge + date + delete */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/20 flex-shrink-0">
                    <User className="w-4 h-4 text-brand-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text text-sm">{item.userName || "Аноним"}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-medium flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        {item.page}
                      </span>
                    </div>
                    {item.userEmail && (
                      <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.userEmail}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => deleteFeedback(item.id)}
                      disabled={busy}
                      title="Удалить"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message text */}
                <div className="mb-3">
                  <p className="text-sm text-text-muted break-words">
                    {isLong && !isExpanded ? item.message.slice(0, 200) + "..." : item.message}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs text-brand-light hover:underline mt-1"
                    >
                      {isExpanded ? "Свернуть" : "Показать полностью"}
                    </button>
                  )}
                </div>

                {/* Status + Priority buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {busy && <Loader2 className="w-4 h-4 text-brand animate-spin" />}

                  {/* Status buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-muted mr-1">Статус:</span>
                    {(["new", "in_progress", "not_important", "fixed"] as const).map((s) => (
                      <button
                        key={s}
                        disabled={busy}
                        onClick={() => item.status !== s && patchFeedback(item.id, { status: s })}
                        className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all disabled:opacity-50 ${getColorClasses(
                          statusColors[s],
                          item.status === s,
                        )} ${item.status === s ? "ring-1 ring-current" : "opacity-60 hover:opacity-100"}`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-4 bg-white/10" />

                  {/* Priority buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-muted mr-1">Приоритет:</span>
                    {(["urgent", "monthly", "future"] as const).map((p) => {
                      const icon =
                        p === "urgent" ? <Flame className="w-3 h-3" /> :
                        p === "monthly" ? <Clock className="w-3 h-3" /> :
                        <Calendar className="w-3 h-3" />;
                      return (
                        <button
                          key={p}
                          disabled={busy}
                          onClick={() => item.priority !== p && patchFeedback(item.id, { priority: p })}
                          className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-1 ${getColorClasses(
                            priorityColors[p],
                            item.priority === p,
                          )} ${item.priority === p ? "ring-1 ring-current" : "opacity-60 hover:opacity-100"}`}
                        >
                          {icon}
                          {priorityLabels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => fetchFeedback(page - 1)}
            disabled={page === 0}
            className="p-2 rounded-lg glass text-text-muted hover:text-text transition-all disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4 -rotate-90" />
          </button>
          <span className="text-sm text-text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => fetchFeedback(page + 1)}
            disabled={page + 1 >= totalPages}
            className="p-2 rounded-lg glass text-text-muted hover:text-text transition-all disabled:opacity-30"
          >
            <ChevronDownIcon className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
}
