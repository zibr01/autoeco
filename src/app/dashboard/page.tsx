"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  Car,
  Wrench,
  Search,
  MessageSquare,
  ShoppingBag,
  AlertTriangle,
  Clock,
  ChevronRight,
  Calendar,
  Shield,
  TrendingUp,
  Gauge,
  Bell,
  Fuel,
  CircleDot,
  FileText,
  Eye,
  Battery,
  Disc,
  MapPin,
  Star,
  ArrowRight,
  Loader2,
  Heart,
  Scale,
  X,
} from "lucide-react";

function WelcomeBanner({ carsCount, bookingsCount }: { carsCount: number; bookingsCount: number }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem("welcome_dismissed") === "true");
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("welcome_dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  if (carsCount === 0) {
    return (
      <div className="relative mb-6 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-transparent p-5">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-text-dim hover:text-text hover:bg-prussian/[0.05] transition-all"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-text mb-1">Добро пожаловать в AutoEco! 👋</h2>
        <p className="text-text-muted text-sm mb-4">Начните с добавления вашего автомобиля</p>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[
            { label: "1. Добавьте авто" },
            { label: "→" },
            { label: "2. Найдите сервис" },
            { label: "→" },
            { label: "3. Запишитесь онлайн" },
          ].map((step, i) =>
            step.label === "→" ? (
              <span key={i} className="text-text-dim text-sm">→</span>
            ) : (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/15 text-brand-light text-sm font-medium"
              >
                {step.label}
              </span>
            )
          )}
        </div>

        <Link
          href="/garage"
          className="btn-primary inline-flex items-center gap-2 text-sm !py-2.5 !px-5"
        >
          <Car className="w-4 h-4" />
          Добавить автомобиль
        </Link>
      </div>
    );
  }

  if (bookingsCount === 0) {
    return (
      <div className="relative mb-6 rounded-2xl border border-prussian/[0.08] bg-white/50 px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={dismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-text-dim hover:text-text hover:bg-prussian/[0.05] transition-all"
          aria-label="Закрыть"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <p className="text-sm text-text-muted pr-6">
          Попробуйте записаться в сервис через AutoEco
        </p>
        <Link
          href="/services"
          className="text-sm font-semibold text-brand-light hover:underline whitespace-nowrap flex-shrink-0"
        >
          Найти сервис →
        </Link>
      </div>
    );
  }

  return null;
}

interface ReminderData {
  id: string;
  type: string;
  title: string;
  dueDate?: string | null;
  dueMileage?: number | null;
  urgency: string;
  description: string;
}

interface MaintenanceData {
  id: string;
  date: string;
  type: string;
  cost: number;
  serviceName: string;
}

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  health: number;
  image: string;
  licensePlate: string;
  reminders: ReminderData[];
  maintenanceRecords: MaintenanceData[];
}

interface BookingData {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  serviceCenter: { name: string; address: string };
  car: { make: string; model: string; licensePlate: string };
}

const statusLabel: Record<string, { text: string; class: string }> = {
  confirmed: { text: "Подтверждено", class: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending: { text: "Ожидает", class: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

const reminderIcons: Record<string, React.ReactNode> = {
  oil: <Fuel className="w-4 h-4" />,
  tires: <CircleDot className="w-4 h-4" />,
  insurance: <FileText className="w-4 h-4" />,
  inspection: <Eye className="w-4 h-4" />,
  battery: <Battery className="w-4 h-4" />,
  brakes: <Disc className="w-4 h-4" />,
};

const urgencyStyles: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  high: { bg: "bg-red-500/5", border: "border-red-500/20", dot: "bg-red-400", text: "text-red-400" },
  medium: { bg: "bg-amber-500/5", border: "border-amber-500/20", dot: "bg-amber-400", text: "text-amber-400" },
  low: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", dot: "bg-emerald-400", text: "text-emerald-400" },
};


function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `через ${Math.abs(days)} дн.`;
  if (days === 0) return "Сегодня";
  if (days === 1) return "Вчера";
  if (days < 7) return `${days} дн. назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
  return `${Math.floor(days / 30)} мес. назад`;
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [carsData, setCarsData] = useState<CarData[]>([]);
  const [bookingsData, setBookingsData] = useState<BookingData[]>([]);
  const [favorites, setFavorites] = useState<{ serviceCenter: { id: string; name: string; typeName: string; rating: number; image: string } }[]>([]);
  const [spending, setSpending] = useState<{
    monthly: { month: string; total: number }[];
    byCategory: { type: string; total: number }[];
    totalSpent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (authStatus === "authenticated") {
      Promise.all([
        fetch("/api/cars").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/favorites").then((r) => r.json()).catch(() => []),
        fetch("/api/analytics/spending").then((r) => r.json()).catch(() => null),
      ])
        .then(([cars, bookings, favs, spendingData]) => {
          setCarsData(Array.isArray(cars) ? cars : []);
          setBookingsData(
            Array.isArray(bookings)
              ? bookings
                  .filter((b: BookingData) => b.status !== "completed")
                  .sort((a: BookingData, b: BookingData) => new Date(a.date).getTime() - new Date(b.date).getTime())
              : []
          );
          setFavorites(Array.isArray(favs) ? favs : []);
          if (spendingData?.monthly) setSpending(spendingData);
        })
        .finally(() => setLoading(false));
    }
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand-light animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Collect all reminders
  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const allReminders = carsData
    .flatMap((car) =>
      car.reminders.map((r) => ({ ...r, carName: `${car.make} ${car.model}`, carId: car.id }))
    )
    .sort((a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2));

  const urgentReminders = allReminders.filter((r) => r.urgency === "high" || r.urgency === "medium");
  const totalMaintenanceCost = carsData.reduce(
    (sum, car) => sum + car.maintenanceRecords.reduce((s, r) => s + r.cost, 0),
    0
  );
  const avgHealth = carsData.length
    ? Math.round(carsData.reduce((s, c) => s + c.health, 0) / carsData.length)
    : 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">
              {greeting}, <span className="text-gradient-brand">{session?.user?.name || "Пользователь"}</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">Вот что происходит с вашими автомобилями</p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-muted bg-white border border-prussian/[0.08] hover:border-brand/30 hover:text-brand-light transition-all"
          >
            <Shield className="w-4 h-4" />
            Профиль
          </Link>
        </div>
      </div>

      {/* Onboarding banner */}
      <WelcomeBanner carsCount={carsData.length} bookingsCount={bookingsData.length} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="card-surface !p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-brand-light" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{carsData.length}</div>
              <div className="text-xs text-text-muted">Автомобилей</div>
            </div>
          </div>
        </div>
        <div className="card-surface !p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{avgHealth}%</div>
              <div className="text-xs text-text-muted">Среднее здоровье</div>
            </div>
          </div>
        </div>
        <div className="card-surface !p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{urgentReminders.length}</div>
              <div className="text-xs text-text-muted">Напоминаний</div>
            </div>
          </div>
        </div>
        <div className="card-surface !p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{(totalMaintenanceCost / 1000).toFixed(0)}к</div>
              <div className="text-xs text-text-muted">₽ на обслуживание</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Car Health */}
          <div className="card-surface">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">Состояние автомобилей</h2>
              <Link href="/garage" className="text-xs text-brand-light hover:text-brand font-medium flex items-center gap-1">
                Все авто <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {carsData.map((car) => {
                const healthColor = car.health >= 80 ? "bg-emerald-400" : car.health >= 60 ? "bg-amber-400" : "bg-red-400";
                const healthTextColor = car.health >= 80 ? "text-emerald-400" : car.health >= 60 ? "text-amber-400" : "text-red-400";
                const nextUrgent = car.reminders.find((r) => r.urgency === "high" || r.urgency === "medium");

                return (
                  <Link key={car.id} href={`/garage/${car.id}`} className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-prussian/[0.02] transition-all group">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0">
                      <img src={car.image} alt={car.make} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text text-sm">{car.make} {car.model}</span>
                        <span className="text-xs text-text-dim">{car.year}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[140px]">
                          <div className="progress-bar !h-1.5">
                            <div className={`progress-fill ${healthColor}`} style={{ width: `${car.health}%` }} />
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${healthTextColor}`}>{car.health}%</span>
                        {nextUrgent && <span className="text-xs text-text-dim truncate hidden sm:block">{nextUrgent.title}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-xs text-text-muted">{car.mileage.toLocaleString("ru")} км</div>
                      <div className="text-xs text-text-dim">{car.licensePlate}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-brand-light transition-colors flex-shrink-0" />
                  </Link>
                );
              })}

              {carsData.length === 0 && (
                <Link href="/garage" className="flex items-center justify-center gap-2 py-8 text-text-muted hover:text-brand-light transition-colors">
                  <Car className="w-5 h-5" />
                  <span className="text-sm">Добавьте свой первый автомобиль</span>
                </Link>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className="card-surface">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-text">Напоминания</h2>
                {urgentReminders.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center">
                    {urgentReminders.length}
                  </span>
                )}
              </div>
              <Link href="/garage" className="text-xs text-brand-light hover:text-brand font-medium flex items-center gap-1">
                Все напоминания <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {allReminders.slice(0, 5).map((reminder) => {
                const style = urgencyStyles[reminder.urgency] || urgencyStyles.low;
                return (
                  <Link key={reminder.id} href={`/garage/${reminder.carId}`} className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg} ${style.border} hover:scale-[1.01] transition-transform`}>
                    <div className={`mt-0.5 ${style.text}`}>{reminderIcons[reminder.type] || <AlertTriangle className="w-4 h-4" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-text">{reminder.title}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      </div>
                      <div className="text-xs text-text-muted">
                        {reminder.carName}
                        {reminder.dueMileage && ` · ${reminder.dueMileage.toLocaleString("ru")} км`}
                        {reminder.dueDate && ` · до ${new Date(reminder.dueDate).toLocaleDateString("ru", { day: "numeric", month: "short" })}`}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-dim flex-shrink-0 mt-0.5" />
                  </Link>
                );
              })}
              {allReminders.length === 0 && (
                <p className="text-center py-6 text-text-muted text-sm">Нет активных напоминаний</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-surface">
            <h2 className="font-semibold text-text mb-4">Последняя активность</h2>
            <div className="space-y-1">
              {(() => {
                const activities: { id: string; icon: React.ReactNode; text: string; detail: string; time: string; sortDate: number }[] = [];
                bookingsData.forEach((b) => {
                  activities.push({
                    id: `b-${b.id}`,
                    icon: <Calendar className="w-4 h-4 text-brand-light" />,
                    text: `Запись: ${b.serviceType}`,
                    detail: `${b.serviceCenter.name} — ${b.car.make} ${b.car.model}`,
                    time: formatTimeAgo(b.date),
                    sortDate: new Date(b.date).getTime(),
                  });
                });
                carsData.forEach((car) => {
                  car.maintenanceRecords.forEach((m) => {
                    activities.push({
                      id: `m-${m.id}`,
                      icon: <Wrench className="w-4 h-4 text-emerald-500" />,
                      text: m.type,
                      detail: `${m.serviceName} — ${car.make} ${car.model} · ${m.cost.toLocaleString("ru")} ₽`,
                      time: formatTimeAgo(m.date),
                      sortDate: new Date(m.date).getTime(),
                    });
                  });
                });
                activities.sort((a, b) => b.sortDate - a.sortDate);
                const items = activities.slice(0, 5);
                if (items.length === 0) {
                  return <p className="text-center py-6 text-text-muted text-sm">Пока нет активности</p>;
                }
                return items.map((item, i) => (
                  <div key={item.id} className="flex items-start gap-3 py-3 relative">
                    {i < items.length - 1 && <div className="absolute left-[11px] top-10 bottom-0 w-px bg-prussian/[0.06]" />}
                    <div className="w-6 h-6 rounded-full bg-white border border-prussian/[0.08] flex items-center justify-center flex-shrink-0 z-10">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text font-medium">{item.text}</div>
                      <div className="text-xs text-text-muted truncate">{item.detail}</div>
                      <div className="text-[10px] text-text-dim mt-0.5">{item.time}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Spending Analytics */}
          {spending && spending.monthly.some((m) => m.total > 0) && (
            <div className="card-surface">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-text">Расходы на обслуживание</h2>
                  <span className="tag text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">за 6 мес.</span>
                </div>
                <span className="text-sm font-bold text-text">{spending.totalSpent.toLocaleString("ru")} ₽</span>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-2 h-32 mb-4">
                {(() => {
                  const maxVal = Math.max(...spending.monthly.map((m) => m.total), 1);
                  return spending.monthly.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex justify-center">
                        <div className="absolute -top-6 hidden group-hover:block text-[10px] font-medium text-text bg-[var(--bg-elevated)] px-2 py-0.5 rounded-lg border border-[var(--border)] shadow-sm whitespace-nowrap z-10">
                          {m.total.toLocaleString("ru")} ₽
                        </div>
                      </div>
                      <div
                        className="w-full max-w-[40px] rounded-t-lg bg-brand/20 relative overflow-hidden transition-all"
                        style={{ height: `${Math.max((m.total / maxVal) * 100, 4)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-brand to-brand-light opacity-70 rounded-t-lg" />
                      </div>
                      <span className="text-[10px] text-text-dim">{m.month}</span>
                    </div>
                  ));
                })()}
              </div>
              {/* Category breakdown */}
              {spending.byCategory.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[var(--divider)]">
                  <p className="text-xs text-text-dim font-medium uppercase tracking-wider">По категориям</p>
                  {spending.byCategory.slice(0, 5).map((cat) => {
                    const pct = Math.round((cat.total / spending.totalSpent) * 100);
                    return (
                      <div key={cat.type} className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center text-text-muted">
                          {reminderIcons[cat.type] || <Wrench className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs text-text-muted flex-1 truncate capitalize">{cat.type}</span>
                        <div className="w-20 h-1.5 rounded-full bg-[var(--hover-bg)] overflow-hidden">
                          <div className="h-full rounded-full bg-brand/50" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-text w-16 text-right">{cat.total.toLocaleString("ru")} ₽</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Bookings */}
          <div className="card-surface">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">Ближайшие записи</h2>
              <Link href="/profile" className="text-xs text-brand-light hover:text-brand font-medium flex items-center gap-1">
                Все записи <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {bookingsData.length > 0 ? (
              <div className="space-y-3">
                {bookingsData.map((b) => {
                  const st = statusLabel[b.status] || statusLabel.pending;
                  const d = new Date(b.date);
                  const daysUntil = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={b.id} className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-prussian/[0.02] transition-all">
                      <div className="w-12 h-12 rounded-xl bg-brand/5 border border-brand/10 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-brand-light leading-none">{d.toLocaleDateString("ru", { day: "numeric" })}</span>
                        <span className="text-[10px] text-text-muted uppercase">{d.toLocaleDateString("ru", { month: "short" })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-text">{b.serviceType}</span>
                          <span className={`tag text-[10px] border ${st.class}`}>{st.text}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.serviceCenter.name}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <span className="text-xs text-text-muted">
                          {daysUntil > 0 ? `через ${daysUntil} дн.` : daysUntil === 0 ? "Сегодня" : "Прошло"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">Нет активных записей</div>
            )}
            <Link href="/services" className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-prussian/[0.1] text-sm text-text-muted hover:border-brand/30 hover:text-brand-light hover:bg-brand/5 transition-all">
              <Wrench className="w-4 h-4" />
              Записаться на сервис
            </Link>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="card-surface">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <h2 className="font-semibold text-text">Избранное</h2>
                </div>
                <Link href="/favorites" className="text-xs text-brand-light hover:text-brand font-medium flex items-center gap-1">
                  Все <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {favorites.slice(0, 3).map((fav) => (
                  <Link key={fav.serviceCenter.id} href={`/services/${fav.serviceCenter.id}`} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-prussian/[0.02] transition-all group">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0">
                      <img src={fav.serviceCenter.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">{fav.serviceCenter.name}</div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span>{fav.serviceCenter.typeName}</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          {fav.serviceCenter.rating}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-brand-light transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Compare CTA */}
          <Link href="/compare" className="card-surface flex items-center gap-3 hover:border-brand/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text text-sm">Сравнить сервисы</h3>
              <p className="text-xs text-text-muted">Цены, рейтинг и услуги бок о бок</p>
            </div>
            <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-brand-light transition-colors flex-shrink-0" />
          </Link>

          {/* AI CTA */}
          <div className="card-surface border-brand/15 bg-gradient-to-br from-brand/[0.03] to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-brand-light" />
              </div>
              <div>
                <h3 className="font-semibold text-text text-sm">AI-диагностика</h3>
                <p className="text-xs text-text-muted">Опишите симптом — получите диагноз</p>
              </div>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Стук, вибрация, запах? AI-помощник проанализирует симптомы и подскажет, куда обратиться.
            </p>
            <Link href="/diagnostics" className="btn-primary w-full justify-center text-sm !py-2.5">
              Начать диагностику
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
