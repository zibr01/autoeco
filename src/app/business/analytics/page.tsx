"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  Repeat2,
  Calendar,
  Clock,
  ArrowUpRight,
  Crown,
} from "lucide-react";

interface AnalyticsData {
  metrics: {
    totalBookings: number;
    completedBookings: number;
    uniqueClients: number;
    repeatClients: number;
    repeatRate: number;
    totalReviews: number;
    avgRating: number;
    clubBookingsCount: number;
    regularBookingsCount: number;
  };
  monthlyTrend: { month: string; total: number; completed: number; cancelled: number }[];
  popularServices: { name: string; count: number }[];
  ratingDistribution: { stars: number; count: number }[];
  reviewTrend: { month: string; count: number; avgRating: number }[];
  topClients: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    visits: number;
    lastVisit: string;
    cars: string[];
  }[];
  hourlyDistribution: { hour: string; count: number }[];
  weekdayDistribution: { day: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/analytics")
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
    return <div className="text-center text-text-muted py-20">Не удалось загрузить аналитику</div>;
  }

  const { metrics, monthlyTrend, popularServices, ratingDistribution, reviewTrend, topClients, hourlyDistribution, weekdayDistribution } = data;
  const clubPercent = metrics.totalBookings > 0 ? Math.round((metrics.clubBookingsCount / metrics.totalBookings) * 100) : 0;
  const maxMonthly = Math.max(...monthlyTrend.map((m) => m.total), 1);
  const maxHourly = Math.max(...hourlyDistribution.map((h) => h.count), 1);
  const maxWeekday = Math.max(...weekdayDistribution.map((d) => d.count), 1);
  const maxRating = Math.max(...ratingDistribution.map((r) => r.count), 1);
  const maxPopular = Math.max(...popularServices.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Аналитика</h1>
        <p className="text-text-muted text-sm mt-1">Детальная статистика вашего сервиса за 6 месяцев</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={BarChart3} label="Всего записей" value={metrics.totalBookings} color="brand" />
        <MetricCard icon={Users} label="Уникальных клиентов" value={metrics.uniqueClients} color="blue" />
        <MetricCard icon={Repeat2} label="Возвращаемость" value={`${metrics.repeatRate}%`} subtitle={`${metrics.repeatClients} повторных`} color="emerald" />
        <MetricCard icon={Star} label="Средний рейтинг" value={metrics.avgRating || "—"} subtitle={`${metrics.totalReviews} отзывов`} color="amber" />
      </div>

      {/* Club Bookings */}
      <div className="card-surface" style={{ borderColor: "rgba(89,50,230,0.15)", background: "linear-gradient(135deg, rgba(89,50,230,0.03), rgba(89,50,230,0.01))" }}>
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-semibold text-text">Заявки через AutoEco Club</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Stat numbers */}
          <div className="sm:col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                <span className="text-sm text-text-muted">Клубники</span>
              </div>
              <span className="text-sm font-bold text-text">{metrics.clubBookingsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-prussian/20" />
                <span className="text-sm text-text-muted">Обычные</span>
              </div>
              <span className="text-sm font-bold text-text">{metrics.regularBookingsCount}</span>
            </div>
          </div>

          {/* Bar visualization */}
          <div className="sm:col-span-1 flex flex-col gap-2">
            <div className="h-5 rounded-full bg-prussian/[0.07] overflow-hidden flex">
              <div
                className="h-full rounded-full bg-brand/70 transition-all"
                style={{ width: `${clubPercent}%`, minWidth: metrics.clubBookingsCount > 0 ? "8px" : "0" }}
                title={`Клубники: ${metrics.clubBookingsCount}`}
              />
            </div>
            <div className="h-5 rounded-full bg-prussian/[0.07] overflow-hidden flex">
              <div
                className="h-full rounded-full bg-prussian/30 transition-all"
                style={{ width: `${100 - clubPercent}%`, minWidth: metrics.regularBookingsCount > 0 ? "8px" : "0" }}
                title={`Обычные: ${metrics.regularBookingsCount}`}
              />
            </div>
          </div>

          {/* Insight */}
          <div className="sm:col-span-1 text-center sm:text-right">
            <p className="text-3xl font-extrabold text-brand tracking-tight">{clubPercent}%</p>
            <p className="text-xs text-text-muted mt-1">
              Клубники приносят {clubPercent}% заявок
            </p>
            {clubPercent > 0 && (
              <p className="text-[11px] text-brand mt-2 font-medium">Premium-клиенты активны</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card-surface">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-semibold text-text">Записи по месяцам</h2>
        </div>
        <div className="flex items-end gap-3 h-44">
          {monthlyTrend.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-text">{m.total}</span>
              <div className="w-full flex flex-col gap-0.5" style={{ height: `${Math.max((m.total / maxMonthly) * 100, 8)}%` }}>
                <div
                  className="w-full bg-brand/60 rounded-t-lg flex-grow"
                  title={`Выполнено: ${m.completed}`}
                />
                {m.cancelled > 0 && (
                  <div
                    className="w-full bg-red-400/40 rounded-b-sm"
                    style={{ height: `${(m.cancelled / m.total) * 100}%`, minHeight: "2px" }}
                    title={`Отменено: ${m.cancelled}`}
                  />
                )}
              </div>
              <span className="text-[11px] text-text-dim">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-text-dim">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand/60" /> Записи</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400/40" /> Отмены</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services */}
        <div className="card-surface">
          <h2 className="text-lg font-semibold text-text mb-4">Популярные услуги</h2>
          {popularServices.length === 0 ? (
            <p className="text-sm text-text-dim py-4 text-center">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {popularServices.map((s) => {
                const percent = Math.round((s.count / maxPopular) * 100);
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-muted">{s.name}</span>
                      <span className="text-sm font-medium text-text">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-prussian/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-brand/50 transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="card-surface">
          <h2 className="text-lg font-semibold text-text mb-4">Распределение оценок</h2>
          <div className="space-y-2.5">
            {ratingDistribution.slice().reverse().map((r) => {
              const percent = maxRating > 0 ? Math.round((r.count / maxRating) * 100) : 0;
              const starColors: Record<number, string> = {
                5: "bg-emerald-400",
                4: "bg-green-400",
                3: "bg-amber-400",
                2: "bg-orange-400",
                1: "bg-red-400",
              };
              return (
                <div key={r.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 w-16">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.stars ? "text-amber-400 fill-current" : "text-text-dim/30"}`} />
                    ))}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-prussian/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${starColors[r.stars]} transition-all`} style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-xs text-text-muted w-6 text-right">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="card-surface">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4.5 h-4.5 text-brand" />
            <h2 className="text-lg font-semibold text-text">Загруженность по часам</h2>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {hourlyDistribution.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-sky-400/40 hover:bg-sky-400/60 transition-colors"
                  style={{ height: `${Math.max((h.count / maxHourly) * 100, 4)}%` }}
                  title={`${h.hour}: ${h.count} записей`}
                />
                <span className="text-[9px] text-text-dim">{h.hour.replace(":00", "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week Distribution */}
        <div className="card-surface">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4.5 h-4.5 text-brand" />
            <h2 className="text-lg font-semibold text-text">Загруженность по дням</h2>
          </div>
          <div className="flex items-end gap-3 h-28">
            {weekdayDistribution.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-text">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-purple-400/40 hover:bg-purple-400/60 transition-colors"
                  style={{ height: `${Math.max((d.count / maxWeekday) * 100, 6)}%` }}
                />
                <span className="text-[11px] text-text-dim font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Trend */}
      <div className="card-surface">
        <h2 className="text-lg font-semibold text-text mb-4">Динамика отзывов</h2>
        <div className="grid grid-cols-6 gap-4">
          {reviewTrend.map((r, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-text">{r.count}</div>
              <div className="text-xs text-text-dim">{r.month}</div>
              {r.avgRating > 0 && (
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span className="text-xs text-amber-400">{r.avgRating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients */}
      <div className="card-surface">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Топ клиенты</h2>
          <a href="/business/clients" className="text-sm text-brand-light hover:text-brand transition-colors flex items-center gap-1">
            Все клиенты <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        {topClients.length === 0 ? (
          <p className="text-sm text-text-dim py-6 text-center">Клиентов пока нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text-dim text-xs uppercase tracking-wider py-2 px-3">Клиент</th>
                  <th className="text-left text-text-dim text-xs uppercase tracking-wider py-2 px-3">Автомобили</th>
                  <th className="text-center text-text-dim text-xs uppercase tracking-wider py-2 px-3">Визиты</th>
                  <th className="text-right text-text-dim text-xs uppercase tracking-wider py-2 px-3">Последний визит</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-prussian/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-text">{c.name}</p>
                      <p className="text-xs text-text-dim">{c.phone || c.email}</p>
                    </td>
                    <td className="py-3 px-3 text-text-muted text-xs">
                      {c.cars.join(", ")}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand/10 text-brand text-xs font-bold">
                        {c.visits}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-text-muted text-xs">
                      {new Date(c.lastVisit).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtitle?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand/10 text-brand",
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="card-surface !p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
      {subtitle && <p className="text-[10px] text-text-dim mt-0.5">{subtitle}</p>}
    </div>
  );
}
