"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Star,
  CheckCircle2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Ticket,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface Stats {
  totalBookings: number;
  monthBookings: number;
  growthPercent: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalReviews: number;
  rating: number;
  conversionRate: number;
  favoritesCount: number;
  activePromos: number;
}

interface Booking {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  user: { name: string | null; phone: string | null };
  car: { make: string; model: string; year: number };
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  carModel: string;
}

interface WeeklyData {
  week: string;
  count: number;
}

interface DashboardData {
  serviceCenter: {
    name: string;
    typeName: string;
    rating: number;
    verified: boolean;
  };
  stats: Stats;
  recentBookings: Booking[];
  recentReviews: Review[];
  weeklyTrend: WeeklyData[];
}

export default function BusinessDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-text-muted py-20">Не удалось загрузить данные</div>;
  }

  const { serviceCenter, stats, recentBookings, recentReviews, weeklyTrend } = data;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Ожидает", color: "text-amber-400 bg-amber-500/10" },
    confirmed: { label: "Подтверждена", color: "text-blue-400 bg-blue-500/10" },
    completed: { label: "Выполнена", color: "text-emerald-400 bg-emerald-500/10" },
    cancelled: { label: "Отменена", color: "text-red-400 bg-red-500/10" },
  };

  const maxWeekly = Math.max(...weeklyTrend.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">{serviceCenter.name}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-text-muted">{serviceCenter.typeName}</span>
          {serviceCenter.verified && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Верифицирован
            </span>
          )}
          {serviceCenter.rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" /> {serviceCenter.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Записей за месяц" value={stats.monthBookings} change={stats.growthPercent} color="brand" />
        <StatCard icon={Clock} label="Ожидают подтверждения" value={stats.pendingBookings} color="amber" />
        <StatCard icon={Users} label="Всего записей" value={stats.totalBookings} color="blue" />
        <StatCard icon={Star} label="Отзывов" value={stats.totalReviews} subtitle={stats.rating > 0 ? `${stats.rating.toFixed(1)} средний рейтинг` : undefined} color="emerald" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-text">{stats.conversionRate}%</p>
            <p className="text-xs text-text-muted">Конверсия</p>
          </div>
        </div>
        <div className="card-surface !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-text">{stats.favoritesCount}</p>
            <p className="text-xs text-text-muted">В избранном</p>
          </div>
        </div>
        <div className="card-surface !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Ticket className="w-4.5 h-4.5 text-sky-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-text">{stats.activePromos}</p>
            <p className="text-xs text-text-muted">Активных промо</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="card-surface">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4.5 h-4.5 text-brand" />
            <h2 className="text-lg font-semibold text-text">Записи по неделям</h2>
          </div>
          <div className="flex items-end gap-3 h-32">
            {weeklyTrend.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-text">{w.count}</span>
                <div className="w-full rounded-t-lg bg-brand/20 relative overflow-hidden" style={{ height: `${Math.max((w.count / maxWeekly) * 100, 8)}%` }}>
                  <div className="absolute inset-0 bg-brand/40 rounded-t-lg" />
                </div>
                <span className="text-[10px] text-text-dim">{w.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="card-surface">
          <h2 className="text-lg font-semibold text-text mb-4">Статусы записей</h2>
          <div className="space-y-3">
            {[
              { label: "Выполнено", count: stats.completedBookings, color: "bg-emerald-400", textColor: "text-emerald-400" },
              { label: "Подтверждено", count: stats.confirmedBookings, color: "bg-blue-400", textColor: "text-blue-400" },
              { label: "Ожидают", count: stats.pendingBookings, color: "bg-amber-400", textColor: "text-amber-400" },
            ].map((item) => {
              const percent = stats.totalBookings > 0 ? Math.round((item.count / stats.totalBookings) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-muted">{item.label}</span>
                    <span className={`text-sm font-medium ${item.textColor}`}>{item.count} ({percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-prussian/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Последние записи</h2>
            <Link href="/business/bookings" className="text-sm text-brand-light hover:text-brand transition-colors">
              Все записи
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-sm text-text-dim py-8 text-center">Записей пока нет</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-prussian/[0.02] border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{b.user.name || "Клиент"}</p>
                    <p className="text-xs text-text-muted">{b.car.make} {b.car.model} &middot; {b.serviceType}</p>
                    <p className="text-xs text-text-dim mt-0.5">
                      {new Date(b.date).toLocaleDateString("ru-RU")} в {b.time}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLabels[b.status]?.color || ""}`}>
                    {statusLabels[b.status]?.label || b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="card-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Последние отзывы</h2>
            <Link href="/business/reviews" className="text-sm text-brand-light hover:text-brand transition-colors">
              Все отзывы
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <p className="text-sm text-text-dim py-8 text-center">Отзывов пока нет</p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-prussian/[0.02] border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text">{r.author}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-current" : "text-text-dim"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2">{r.text}</p>
                  <p className="text-[10px] text-text-dim mt-1">
                    {r.carModel} &middot; {new Date(r.date).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  change?: number;
  subtitle?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand/10 text-brand",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="card-surface !p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
      {subtitle && <p className="text-[10px] text-text-dim mt-0.5">{subtitle}</p>}
    </div>
  );
}
