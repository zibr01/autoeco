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
} from "lucide-react";

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

const quickActions = [
  { href: "/garage", icon: <Car className="w-5 h-5" />, label: "Гараж", desc: "Мои автомобили", color: "text-brand-light", bg: "bg-brand/10" },
  { href: "/services", icon: <Wrench className="w-5 h-5" />, label: "Сервисы", desc: "Найти автосервис", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { href: "/diagnostics", icon: <MessageSquare className="w-5 h-5" />, label: "Диагностика", desc: "AI-помощник", color: "text-amber-500", bg: "bg-amber-500/10" },
  { href: "/parts", icon: <ShoppingBag className="w-5 h-5" />, label: "Запчасти", desc: "Поиск и подбор", color: "text-sky-500", bg: "bg-sky-500/10" },
];

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
      ])
        .then(([cars, bookings]) => {
          setCarsData(Array.isArray(cars) ? cars : []);
          setBookingsData(
            Array.isArray(bookings)
              ? bookings.filter((b: BookingData) => b.status !== "completed")
              : []
          );
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
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="card-surface">
            <h2 className="font-semibold text-text mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-prussian/[0.06] hover:border-brand/20 hover:shadow-sm transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>{action.icon}</div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-text">{action.label}</div>
                    <div className="text-[10px] text-text-dim">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-surface">
            <h2 className="font-semibold text-text mb-4">Последняя активность</h2>
            <div className="space-y-1">
              {(() => {
                const activities: { id: string; icon: React.ReactNode; text: string; detail: string; time: string; sortDate: number }[] = [];

                // Bookings as activity
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

                // Maintenance records as activity
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
