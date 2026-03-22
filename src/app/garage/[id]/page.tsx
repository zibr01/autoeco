"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/Toast";
import {
  ChevronLeft,
  Car,
  Gauge,
  Fuel,
  Settings,
  Bell,
  FileText,
  MapPin,
  Droplets,
  Wind,
  Shield,
  Wrench,
  Battery,
  Disc,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Plus,
  X,
  AlertCircle,
  Pencil,
  Trash2,
  Receipt,
  Package,
  TrendingUp,
  Calendar,
  Tag,
} from "lucide-react";

const tabs = ["Журнал ТО", "Расходы", "Запчасти", "Напоминания", "Документы"] as const;
type Tab = (typeof tabs)[number];

const reminderIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  oil: Droplets,
  tires: Wind,
  insurance: Shield,
  inspection: Wrench,
  battery: Battery,
  brakes: Disc,
};

const urgencyBadge: Record<string, string> = {
  low: "tag-green",
  medium: "tag-accent",
  high: "tag-red",
};

const urgencyLabel: Record<string, string> = {
  low: "В порядке",
  medium: "Скоро",
  high: "Срочно",
};

interface MaintenanceRecord {
  id: string;
  date: string;
  mileage: number;
  type: string;
  description: string;
  cost: number;
  serviceName: string;
}

interface Reminder {
  id: string;
  type: string;
  title: string;
  dueDate?: string | null;
  dueMileage?: number | null;
  urgency: string;
  description: string;
}

interface DocumentItem {
  id: string;
  type: string;
  title: string;
  number: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  insurer: string | null;
  cost: number | null;
  notes: string | null;
  status: "valid" | "expiring" | "expired";
}

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string | null;
  mileage: number | null;
}

interface InstalledPartItem {
  id: string;
  name: string;
  partNumber: string | null;
  brand: string | null;
  price: number | null;
  installDate: string;
  installMileage: number | null;
  purchasePlace: string | null;
  warrantyMonths: number | null;
  notes: string | null;
}

const expenseCategoryLabels: Record<string, string> = {
  fuel: "Топливо",
  maintenance: "ТО / Ремонт",
  wash: "Мойка",
  fines: "Штрафы",
  parking: "Парковка",
  insurance: "Страховка",
  parts: "Запчасти",
  other: "Прочее",
};

const expenseCategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  fuel: Fuel,
  maintenance: Wrench,
  wash: Droplets,
  fines: AlertTriangle,
  parking: MapPin,
  insurance: Shield,
  parts: Package,
  other: Receipt,
};

const expenseCategoryColors: Record<string, string> = {
  fuel: "bg-amber-500/20 text-amber-400",
  maintenance: "bg-brand/20 text-brand-light",
  wash: "bg-sky-500/20 text-sky-400",
  fines: "bg-red-500/20 text-red-400",
  parking: "bg-purple-500/20 text-purple-400",
  insurance: "bg-emerald-500/20 text-emerald-400",
  parts: "bg-accent/20 text-accent",
  other: "bg-gray-500/20 text-gray-400",
};

const docTypeLabels: Record<string, string> = {
  osago: "ОСАГО",
  kasko: "КАСКО",
  sts: "СТС",
  pts: "ПТС",
  inspection: "Техосмотр",
  license: "Водительское удостоверение",
  other: "Другое",
};

const docTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  osago: Shield,
  kasko: Shield,
  sts: FileText,
  pts: FileText,
  inspection: CheckCircle2,
  license: FileText,
  other: FileText,
};

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  color: string;
  engine: string;
  transmission: string;
  fuelType: string;
  health: number;
  image: string;
  licensePlate: string;
  nextService: string;
  maintenanceRecords: MaintenanceRecord[];
  reminders: Reminder[];
}

export default function CarProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Журнал ТО");
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showEditCar, setShowEditCar] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showMileageInput, setShowMileageInput] = useState(false);
  const [newMileage, setNewMileage] = useState("");
  const [mileageLoading, setMileageLoading] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [installedParts, setInstalledParts] = useState<InstalledPartItem[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [analytics, setAnalytics] = useState<{
    total: number;
    thisMonth: number;
    count: number;
    byCategory: Record<string, number>;
    byMonth: { month: string; amount: number }[];
  } | null>(null);

  const fetchAnalytics = () => {
    fetch(`/api/cars/${id}/expenses/analytics`)
      .then((res) => res.json())
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  };

  const fetchExpenses = () => {
    setExpensesLoading(true);
    fetch(`/api/cars/${id}/expenses`)
      .then((res) => res.json())
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setExpenses([]))
      .finally(() => setExpensesLoading(false));
  };

  const fetchParts = () => {
    setPartsLoading(true);
    fetch(`/api/cars/${id}/parts`)
      .then((res) => res.json())
      .then((data) => setInstalledParts(Array.isArray(data) ? data : []))
      .catch(() => setInstalledParts([]))
      .finally(() => setPartsLoading(false));
  };

  const fetchCar = () => {
    fetch(`/api/cars/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setCar)
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
  };

  const fetchDocuments = () => {
    setDocsLoading(true);
    fetch(`/api/cars/${id}/documents`)
      .then((res) => res.json())
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  };

  const handleMileageUpdate = async () => {
    const val = Number(newMileage);
    if (!val || val <= 0) return;
    if (car && val < car.mileage) {
      toast("Пробег не может быть меньше текущего", "warning");
      return;
    }
    setMileageLoading(true);
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mileage: val }),
      });
      if (res.ok) {
        setCar((prev) => prev ? { ...prev, mileage: val } : prev);
        setShowMileageInput(false);
        setNewMileage("");
      }
    } catch {
      toast("Не удалось обновить пробег", "error");
    } finally {
      setMileageLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Документы" && car) {
      fetchDocuments();
    }
    if (activeTab === "Расходы" && car) {
      fetchExpenses();
      fetchAnalytics();
    }
    if (activeTab === "Запчасти" && car) {
      fetchParts();
    }
  }, [activeTab, car?.id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchCar();
    }
  }, [id, status, router]);

  if (loading || status === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!car) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <Car className="w-16 h-16 text-text-dim mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">Автомобиль не найден</h2>
          <Link href="/garage" className="btn-ghost mt-4 inline-flex">
            Вернуться в гараж
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back */}
      <Link
        href="/garage"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Мой гараж
      </Link>

      {/* Car hero */}
      <div className="card-surface mb-6 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Image */}
          <div className="h-40 sm:h-56 md:h-auto rounded-xl overflow-hidden bg-bg-elevated">
            {car.image ? (
              <img
                src={car.image}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-dim">
                <Car className="w-16 h-16 opacity-30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="py-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  {car.make} {car.model}
                </h1>
                <p className="text-text-muted">{car.year} · {car.licensePlate}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`tag ${car.health > 80 ? "tag-green" : car.health > 60 ? "tag-accent" : "tag-red"}`}>
                  {car.health > 80 ? "Хорошее" : car.health > 60 ? "Среднее" : "Требует внимания"}
                </div>
                <button onClick={() => setShowEditCar(true)} className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors" title="Редактировать">
                  <Pencil className="w-4 h-4 text-text-muted" />
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Удалить">
                  <Trash2 className="w-4 h-4 text-text-dim hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* Health */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-muted">Состояние автомобиля</span>
                <span className="text-text font-semibold">{car.health}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${
                    car.health > 80 ? "bg-emerald-500" : car.health > 60 ? "bg-accent" : "bg-red-500"
                  }`}
                  style={{ width: `${car.health}%` }}
                />
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <Gauge className="w-4 h-4 text-brand-light" />
                {showMileageInput ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={newMileage}
                      onChange={(e) => setNewMileage(e.target.value)}
                      placeholder={String(car.mileage)}
                      className="input-field text-sm !py-1 !px-2 w-28"
                      min={0}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleMileageUpdate();
                        if (e.key === "Escape") { setShowMileageInput(false); setNewMileage(""); }
                      }}
                    />
                    <button
                      onClick={handleMileageUpdate}
                      disabled={mileageLoading}
                      className="p-1 rounded-lg bg-brand/20 hover:bg-brand/30 transition-colors"
                    >
                      {mileageLoading ? <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-brand-light" />}
                    </button>
                    <button
                      onClick={() => { setShowMileageInput(false); setNewMileage(""); }}
                      className="p-1 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-text-dim" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowMileageInput(true); setNewMileage(String(car.mileage)); }}
                    className="flex items-center gap-1.5 hover:text-text transition-colors group/mileage"
                    title="Обновить пробег"
                  >
                    <span>{car.mileage.toLocaleString("ru")} км</span>
                    <Pencil className="w-3 h-3 opacity-0 group-hover/mileage:opacity-100 transition-opacity text-brand-light" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Settings className="w-4 h-4 text-brand-light" />
                <span>{car.transmission}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Fuel className="w-4 h-4 text-brand-light" />
                <span>{car.fuelType}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Car className="w-4 h-4 text-brand-light" />
                <span>{car.engine}</span>
              </div>
            </div>

            {/* VIN */}
            <div className="mt-4 glass rounded-xl px-4 py-2 text-xs text-text-muted">
              VIN: <span className="text-text font-mono">{car.vin}</span>
            </div>

            {/* Next service + action */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-text-muted">Следующее ТО:</span>
                <span className={`font-medium ${car.nextService === "просрочено" ? "text-red-400" : "text-accent"}`}>
                  {car.nextService}
                </span>
              </div>
              <Link href="/services" className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                Найти сервис
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 sm:gap-2 mb-6 glass p-1 rounded-xl overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-1 sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === tab
                ? "bg-brand text-white shadow-brand"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Журнал ТО" && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => setShowAddMaintenance(true)} className="btn-primary text-sm !py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Добавить запись
            </button>
          </div>
          {car.maintenanceRecords.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <Wrench className="w-10 h-10 mx-auto mb-3 text-text-dim" />
              <p>Записей о ТО пока нет</p>
            </div>
          )}
          {car.maintenanceRecords.map((record, i) => (
            <div key={record.id} className="flex gap-4 group">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                {i < car.maintenanceRecords.length - 1 && (
                  <div className="w-px flex-1 bg-prussian/[0.1] mt-1" />
                )}
              </div>

              {/* Card */}
              <div className="card-surface flex-1 mb-3 group-last:mb-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-text">{record.type}</h3>
                    <p className="text-text-muted text-sm mt-0.5">{record.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-text font-semibold">
                      {record.cost.toLocaleString("ru")} ₽
                    </div>
                    <div className="text-xs text-text-muted">
                      {new Date(record.date).toLocaleDateString("ru", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-prussian/[0.04] text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" />
                    {record.mileage.toLocaleString("ru")} км
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {record.serviceName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Расходы" && (
        <div>
          {/* Analytics cards */}
          {analytics && analytics.count > 0 && (
            <div className="mb-6 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-text-dim uppercase tracking-wider mb-1">За всё время</div>
                  <div className="text-lg font-bold text-text">{analytics.total.toLocaleString("ru")} ₽</div>
                  <div className="text-xs text-text-muted">{analytics.count} записей</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Этот месяц</div>
                  <div className="text-lg font-bold text-text">{analytics.thisMonth.toLocaleString("ru")} ₽</div>
                </div>
                <div className="glass rounded-xl p-4 col-span-2 md:col-span-1">
                  <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Среднее / мес</div>
                  <div className="text-lg font-bold text-text">
                    {Math.round(analytics.total / Math.max(analytics.byMonth.filter(m => m.amount > 0).length, 1)).toLocaleString("ru")} ₽
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-text-dim uppercase tracking-wider mb-3">По категориям</div>
                <div className="space-y-2">
                  {Object.entries(analytics.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount]) => {
                      const pct = Math.round((amount / analytics.total) * 100);
                      const Icon = expenseCategoryIcons[cat] || Receipt;
                      const colorClass = expenseCategoryColors[cat] || "bg-gray-500/20 text-gray-400";
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-text-muted">{expenseCategoryLabels[cat] || cat}</span>
                              <span className="text-text font-medium">{amount.toLocaleString("ru")} ₽</span>
                            </div>
                            <div className="progress-bar h-1.5">
                              <div
                                className="progress-fill bg-brand"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-text-dim w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Monthly bar chart */}
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-text-dim uppercase tracking-wider mb-3">По месяцам</div>
                <div className="flex items-end gap-1 h-24">
                  {analytics.byMonth.map((m, i) => {
                    const maxAmount = Math.max(...analytics.byMonth.map(x => x.amount), 1);
                    const heightPct = Math.max((m.amount / maxAmount) * 100, 2);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full relative group">
                          {m.amount > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs text-text bg-bg-card border border-[var(--border)] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                              {m.amount.toLocaleString("ru")} ₽
                            </div>
                          )}
                          <div
                            className="w-full rounded-t bg-brand/60 hover:bg-brand transition-colors"
                            style={{ height: `${heightPct}%`, minHeight: "2px" }}
                          />
                        </div>
                        <span className="text-[9px] text-text-dim leading-none">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-text-muted font-medium">История расходов</div>
            <button onClick={() => setShowAddExpense(true)} className="btn-primary text-sm !py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Добавить расход
            </button>
          </div>

          {expensesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-text-dim" />
              <p>Расходов пока нет</p>
              <p className="text-xs text-text-dim mt-1">Записывайте все траты на авто: топливо, ТО, штрафы, мойки</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => {
                const Icon = expenseCategoryIcons[expense.category] || Receipt;
                const colorClass = expenseCategoryColors[expense.category] || "bg-gray-500/20 text-gray-400";
                return (
                  <div key={expense.id} className="card-surface flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text text-sm">
                          {expenseCategoryLabels[expense.category] || expense.category}
                        </span>
                        {expense.description && (
                          <span className="text-text-dim text-xs truncate">— {expense.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-dim mt-0.5">
                        <span>{new Date(expense.date).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {expense.mileage && (
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            {expense.mileage.toLocaleString("ru")} км
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-semibold text-text">{expense.amount.toLocaleString("ru")} ₽</span>
                      <button
                        onClick={async () => {
                          if (!confirm("Удалить расход?")) return;
                          await fetch(`/api/cars/${car.id}/expenses?expenseId=${expense.id}`, { method: "DELETE" });
                          fetchExpenses();
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-text-dim hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "Запчасти" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddPart(true)} className="btn-primary text-sm !py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Добавить запчасть
            </button>
          </div>

          {partsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : installedParts.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Package className="w-10 h-10 mx-auto mb-3 text-text-dim" />
              <p>Установленных запчастей пока нет</p>
              <p className="text-xs text-text-dim mt-1">Записывайте какие запчасти установлены, когда и где купили</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {installedParts.map((part) => {
                const warrantyEnd = part.warrantyMonths
                  ? new Date(new Date(part.installDate).setMonth(new Date(part.installDate).getMonth() + part.warrantyMonths))
                  : null;
                const warrantyActive = warrantyEnd ? warrantyEnd > new Date() : false;
                return (
                  <div key={part.id} className="card-surface">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                          <Package className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text text-sm">{part.name}</h4>
                          {part.brand && <span className="text-xs text-text-dim">{part.brand}</span>}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm("Удалить запчасть?")) return;
                          await fetch(`/api/cars/${car.id}/parts?partId=${part.id}`, { method: "DELETE" });
                          fetchParts();
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-text-dim hover:text-red-400" />
                      </button>
                    </div>

                    {part.partNumber && (
                      <div className="text-xs text-text-dim font-mono mb-2">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {part.partNumber}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-2 pt-2 border-t border-prussian/[0.04]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(part.installDate).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {part.installMileage && (
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {part.installMileage.toLocaleString("ru")} км
                        </span>
                      )}
                      {part.price != null && (
                        <span className="font-medium text-text">
                          {part.price.toLocaleString("ru")} ₽
                        </span>
                      )}
                      {part.warrantyMonths && (
                        <span className={`tag text-xs ${warrantyActive ? "tag-green" : "tag-red"}`}>
                          {warrantyActive ? "Гарантия" : "Гарантия истекла"}
                        </span>
                      )}
                    </div>
                    {part.purchasePlace && (
                      <div className="text-xs text-text-dim mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {part.purchasePlace}
                      </div>
                    )}
                    {part.notes && (
                      <div className="text-xs text-text-dim mt-1 italic">{part.notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "Напоминания" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddReminder(true)} className="btn-primary text-sm !py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Добавить напоминание
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
          {car.reminders.length === 0 && (
            <div className="col-span-2 text-center py-12 text-text-muted">
              <Bell className="w-10 h-10 mx-auto mb-3 text-text-dim" />
              <p>Напоминаний пока нет</p>
            </div>
          )}
          {car.reminders.map((reminder) => {
            const Icon = reminderIcons[reminder.type] || Bell;
            return (
              <div
                key={reminder.id}
                className={`rounded-2xl p-5 border ${
                  reminder.urgency === "high"
                    ? "bg-red-500/10 border-red-500/20"
                    : reminder.urgency === "medium"
                    ? "bg-accent/10 border-accent/20"
                    : "bg-bg-card border-prussian/[0.04]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        reminder.urgency === "high"
                          ? "bg-red-500/20"
                          : reminder.urgency === "medium"
                          ? "bg-accent/20"
                          : "bg-brand/20"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          reminder.urgency === "high"
                            ? "text-red-400"
                            : reminder.urgency === "medium"
                            ? "text-accent"
                            : "text-brand-light"
                        }`}
                      />
                    </div>
                    <span className="font-semibold text-text text-sm">{reminder.title}</span>
                  </div>
                  <span className={(urgencyBadge[reminder.urgency] || "tag-green") + " text-xs"}>
                    {urgencyLabel[reminder.urgency] || "В порядке"}
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-3">{reminder.description}</p>
                {reminder.urgency !== "low" && (
                  <Link
                    href="/services"
                    className="flex items-center gap-1 text-brand-light text-sm font-medium hover:gap-2 transition-all"
                  >
                    Найти сервис <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {activeTab === "Документы" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddDocument(true)} className="btn-primary text-sm !py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Добавить документ
            </button>
          </div>

          {docsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="w-10 h-10 mx-auto mb-3 text-text-dim" />
              <p>Документов пока нет</p>
              <p className="text-xs text-text-dim mt-1">Добавьте ОСАГО, КАСКО, СТС и другие документы</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const Icon = docTypeIcons[doc.type] || FileText;
                const statusColors = {
                  valid: "bg-bg-card border-prussian/[0.04]",
                  expiring: "bg-accent/10 border-accent/20",
                  expired: "bg-red-500/10 border-red-500/20",
                };
                return (
                  <div key={doc.id} className={`rounded-2xl p-5 border ${statusColors[doc.status]}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        doc.status === "expired" ? "bg-red-500/20" : doc.status === "expiring" ? "bg-accent/20" : "bg-brand/20"
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          doc.status === "expired" ? "text-red-400" : doc.status === "expiring" ? "text-accent" : "text-brand-light"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-text text-sm block">{doc.title}</span>
                        <span className="text-xs text-text-dim">{docTypeLabels[doc.type] || doc.type}</span>
                      </div>
                      {doc.status === "expired" && (
                        <span className="tag-red text-xs">Истёк</span>
                      )}
                      {doc.status === "expiring" && (
                        <span className="tag-accent text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Истекает
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm("Удалить документ?")) return;
                          await fetch(`/api/cars/${car.id}/documents?docId=${doc.id}`, { method: "DELETE" });
                          fetchDocuments();
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-text-dim hover:text-red-400" />
                      </button>
                    </div>
                    {doc.number && (
                      <div className="text-text-muted text-sm mt-1 font-mono">{doc.number}</div>
                    )}
                    {doc.insurer && (
                      <div className="text-text-dim text-xs mt-1">{doc.insurer}</div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-dim">
                      {doc.issueDate && (
                        <span>Выдан: {new Date(doc.issueDate).toLocaleDateString("ru-RU")}</span>
                      )}
                      {doc.expiryDate && (
                        <span className={doc.status === "expired" ? "text-red-400" : doc.status === "expiring" ? "text-accent" : ""}>
                          До: {new Date(doc.expiryDate).toLocaleDateString("ru-RU")}
                        </span>
                      )}
                      {doc.cost != null && (
                        <span>{doc.cost.toLocaleString("ru")} ₽</span>
                      )}
                    </div>
                    {doc.notes && (
                      <div className="text-xs text-text-dim mt-2 italic">{doc.notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-text mb-2">Удалить автомобиль?</h3>
            <p className="text-sm text-text-muted mb-5">
              {car.make} {car.model} ({car.year}) будет удалён вместе с записями ТО и напоминаниями. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center text-sm !py-2.5">
                Отмена
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/cars/${car.id}`, { method: "DELETE" });
                    if (res.ok) {
                      router.push("/garage");
                    } else {
                      toast("Ошибка при удалении автомобиля", "error");
                      setDeleting(false);
                    }
                  } catch {
                    toast("Ошибка сети. Попробуйте позже", "error");
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit car modal */}
      {showEditCar && (
        <EditCarModal
          car={car}
          onClose={() => setShowEditCar(false)}
          onSaved={() => {
            setShowEditCar(false);
            fetchCar();
          }}
        />
      )}

      {showAddDocument && (
        <AddDocumentModal
          carId={car.id}
          onClose={() => setShowAddDocument(false)}
          onAdded={() => {
            setShowAddDocument(false);
            fetchDocuments();
          }}
        />
      )}

      {showAddReminder && (
        <AddReminderModal
          carId={car.id}
          onClose={() => setShowAddReminder(false)}
          onAdded={() => {
            setShowAddReminder(false);
            fetchCar();
          }}
        />
      )}

      {showAddMaintenance && (
        <AddMaintenanceModal
          carId={car.id}
          currentMileage={car.mileage}
          onClose={() => setShowAddMaintenance(false)}
          onAdded={() => {
            setShowAddMaintenance(false);
            fetchCar();
          }}
        />
      )}

      {showAddExpense && (
        <AddExpenseModal
          carId={car.id}
          currentMileage={car.mileage}
          onClose={() => setShowAddExpense(false)}
          onAdded={() => {
            setShowAddExpense(false);
            fetchExpenses();
          }}
        />
      )}

      {showAddPart && (
        <AddPartModal
          carId={car.id}
          currentMileage={car.mileage}
          onClose={() => setShowAddPart(false)}
          onAdded={() => {
            setShowAddPart(false);
            fetchParts();
          }}
        />
      )}
    </AppLayout>
  );
}

function AddMaintenanceModal({
  carId,
  currentMileage,
  onClose,
  onAdded,
}: {
  carId: string;
  currentMileage: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mileage: currentMileage,
    type: "Плановое ТО",
    description: "",
    cost: 0,
    serviceName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | number) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.type || !form.description) {
      setError("Тип работы и описание обязательны");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mileage: Number(form.mileage),
          cost: Number(form.cost),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
        setLoading(false);
        return;
      }

      onAdded();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  const serviceTypes = [
    "Плановое ТО",
    "Замена масла",
    "Замена тормозных колодок",
    "Замена тормозных дисков и колодок",
    "Замена шин",
    "Замена ремня ГРМ",
    "Замена свечей",
    "Замена тормозной жидкости",
    "Замена аккумулятора",
    "Диагностика",
    "Ремонт ходовой",
    "Ремонт двигателя",
    "Кузовной ремонт",
    "Другое",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Добавить запись ТО</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Тип работы *</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className="input-field text-sm">
              {serviceTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Описание *</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field text-sm min-h-[80px] resize-none" placeholder="Что было сделано..." required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Дата</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пробег (км)</label>
              <input type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} className="input-field text-sm" min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Стоимость (₽)</label>
              <input type="number" value={form.cost} onChange={(e) => update("cost", e.target.value)} className="input-field text-sm" min={0} />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Сервис</label>
              <input type="text" value={form.serviceName} onChange={(e) => update("serviceName", e.target.value)} className="input-field text-sm" placeholder="Название сервиса" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить запись
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditCarModal({
  car,
  onClose,
  onSaved,
}: {
  car: CarData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    mileage: car.mileage,
    color: car.color,
    engine: car.engine,
    transmission: car.transmission,
    fuelType: car.fuelType,
    licensePlate: car.licensePlate,
    nextService: car.nextService,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | number) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mileage: Number(form.mileage),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при сохранении");
        setLoading(false);
        return;
      }

      onSaved();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Редактировать {car.make} {car.model}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пробег (км)</label>
              <input type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} className="input-field text-sm" min={0} />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Госномер</label>
              <input type="text" value={form.licensePlate} onChange={(e) => update("licensePlate", e.target.value.toUpperCase())} className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Цвет</label>
            <input type="text" value={form.color} onChange={(e) => update("color", e.target.value)} className="input-field text-sm" />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Двигатель</label>
            <input type="text" value={form.engine} onChange={(e) => update("engine", e.target.value)} className="input-field text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">КПП</label>
              <select value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className="input-field text-sm">
                <option>Автомат</option>
                <option>Механика</option>
                <option>Робот</option>
                <option>Вариатор</option>
                {!["Автомат", "Механика", "Робот", "Вариатор"].includes(form.transmission) && (
                  <option>{form.transmission}</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Топливо</label>
              <select value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)} className="input-field text-sm">
                <option>Бензин</option>
                <option>Дизель</option>
                <option>Гибрид</option>
                <option>Электро</option>
                <option>Газ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Следующее ТО</label>
            <input type="text" value={form.nextService} onChange={(e) => update("nextService", e.target.value)} className="input-field text-sm" placeholder="через 5 000 км" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Сохранить изменения
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddDocumentModal({
  carId,
  onClose,
  onAdded,
}: {
  carId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    type: "osago",
    title: "ОСАГО",
    number: "",
    issueDate: "",
    expiryDate: "",
    insurer: "",
    cost: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const docTypes = [
    { value: "osago", label: "ОСАГО" },
    { value: "kasko", label: "КАСКО" },
    { value: "sts", label: "СТС" },
    { value: "pts", label: "ПТС" },
    { value: "inspection", label: "Техосмотр" },
    { value: "license", label: "Водительское удостоверение" },
    { value: "other", label: "Другое" },
  ];

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleTypeChange = (type: string) => {
    const label = docTypes.find((d) => d.value === type)?.label || "";
    setForm((p) => ({ ...p, type, title: label }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title) {
      setError("Название обязательно");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
        setLoading(false);
        return;
      }

      onAdded();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  const showInsurer = form.type === "osago" || form.type === "kasko";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Добавить документ</h2>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Тип документа *</label>
            <select value={form.type} onChange={(e) => handleTypeChange(e.target.value)} className="input-field text-sm">
              {docTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Название *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field text-sm" placeholder="Название документа" required />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Номер</label>
            <input type="text" value={form.number} onChange={(e) => update("number", e.target.value)} className="input-field text-sm font-mono" placeholder="Серия и номер" />
          </div>

          {showInsurer && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Страховая компания</label>
              <input type="text" value={form.insurer} onChange={(e) => update("insurer", e.target.value)} className="input-field text-sm" placeholder="Название страховой" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Дата выдачи</label>
              <input type="date" value={form.issueDate} onChange={(e) => update("issueDate", e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Действует до</label>
              <input type="date" value={form.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Стоимость (₽)</label>
            <input type="number" value={form.cost} onChange={(e) => update("cost", e.target.value)} className="input-field text-sm" min={0} placeholder="0" />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Заметки</label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input-field text-sm min-h-[60px] resize-none" placeholder="Дополнительная информация..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить документ
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddExpenseModal({
  carId,
  currentMileage,
  onClose,
  onAdded,
}: {
  carId: string;
  currentMileage: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    category: "fuel",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    mileage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const categories = [
    { value: "fuel", label: "Топливо" },
    { value: "maintenance", label: "ТО / Ремонт" },
    { value: "wash", label: "Мойка" },
    { value: "fines", label: "Штрафы" },
    { value: "parking", label: "Парковка" },
    { value: "insurance", label: "Страховка" },
    { value: "parts", label: "Запчасти" },
    { value: "other", label: "Прочее" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Укажите сумму");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          amount: Number(form.amount),
          date: form.date,
          description: form.description || null,
          mileage: form.mileage ? Number(form.mileage) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
        setLoading(false);
        return;
      }

      onAdded();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Добавить расход</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Категория *</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = expenseCategoryIcons[cat.value] || Receipt;
                const isActive = form.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update("category", cat.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all border ${
                      isActive
                        ? "bg-brand/20 border-brand/30 text-brand-light"
                        : "bg-transparent border-[var(--border)] text-text-muted hover:border-text-dim"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Сумма (₽) *</label>
              <input type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} className="input-field text-sm" min={0} placeholder="0" required autoFocus />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Дата</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Описание</label>
            <input type="text" value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field text-sm" placeholder="Например: АЗС Лукойл, 42л" />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пробег, км (опц.)</label>
            <input type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} className="input-field text-sm" min={0} placeholder={String(currentMileage)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить расход
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddPartModal({
  carId,
  currentMileage,
  onClose,
  onAdded,
}: {
  carId: string;
  currentMileage: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    partNumber: "",
    brand: "",
    price: "",
    installDate: new Date().toISOString().split("T")[0],
    installMileage: String(currentMileage),
    purchasePlace: "",
    warrantyMonths: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Название запчасти обязательно");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          partNumber: form.partNumber || null,
          brand: form.brand || null,
          price: form.price ? Number(form.price) : null,
          installDate: form.installDate,
          installMileage: form.installMileage ? Number(form.installMileage) : null,
          purchasePlace: form.purchasePlace || null,
          warrantyMonths: form.warrantyMonths ? Number(form.warrantyMonths) : null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
        setLoading(false);
        return;
      }

      onAdded();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Добавить запчасть</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Название запчасти *</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field text-sm" placeholder="Например: Масляный фильтр" required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Бренд</label>
              <input type="text" value={form.brand} onChange={(e) => update("brand", e.target.value)} className="input-field text-sm" placeholder="Mann, Bosch..." />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Артикул</label>
              <input type="text" value={form.partNumber} onChange={(e) => update("partNumber", e.target.value)} className="input-field text-sm font-mono" placeholder="HU 6002 z" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Цена (₽)</label>
              <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="input-field text-sm" min={0} placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Гарантия (мес.)</label>
              <input type="number" value={form.warrantyMonths} onChange={(e) => update("warrantyMonths", e.target.value)} className="input-field text-sm" min={0} placeholder="12" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Дата установки</label>
              <input type="date" value={form.installDate} onChange={(e) => update("installDate", e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пробег (км)</label>
              <input type="number" value={form.installMileage} onChange={(e) => update("installMileage", e.target.value)} className="input-field text-sm" min={0} />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Где куплено</label>
            <input type="text" value={form.purchasePlace} onChange={(e) => update("purchasePlace", e.target.value)} className="input-field text-sm" placeholder="Магазин, онлайн..." />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Заметки</label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input-field text-sm min-h-[60px] resize-none" placeholder="Доп. информация..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить запчасть
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddReminderModal({
  carId,
  onClose,
  onAdded,
}: {
  carId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    type: "other",
    title: "",
    description: "",
    dueDate: "",
    dueMileage: "",
    urgency: "low",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const reminderTypes = [
    { value: "oil", label: "Замена масла" },
    { value: "tires", label: "Шины" },
    { value: "insurance", label: "Страховка" },
    { value: "inspection", label: "Техосмотр" },
    { value: "battery", label: "Аккумулятор" },
    { value: "brakes", label: "Тормоза" },
    { value: "other", label: "Другое" },
  ];

  const urgencyOptions = [
    { value: "low", label: "Низкая" },
    { value: "medium", label: "Средняя" },
    { value: "high", label: "Высокая" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Название обязательно");
      return;
    }
    if (!form.description.trim()) {
      setError("Описание обязательно");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim(),
          dueDate: form.dueDate || null,
          dueMileage: form.dueMileage ? Number(form.dueMileage) : null,
          urgency: form.urgency,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
        setLoading(false);
        return;
      }

      onAdded();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Добавить напоминание</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Тип *</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className="input-field text-sm">
              {reminderTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Название *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field text-sm" placeholder="Например: Замена масла" required />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Описание *</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field text-sm min-h-[80px] resize-none" placeholder="Подробности напоминания..." required />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Срочность</label>
            <div className="flex gap-2">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("urgency", opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                    form.urgency === opt.value
                      ? opt.value === "high"
                        ? "bg-red-500/20 border-red-500/30 text-red-400"
                        : opt.value === "medium"
                        ? "bg-accent/20 border-accent/30 text-accent"
                        : "bg-brand/20 border-brand/30 text-brand-light"
                      : "bg-transparent border-[var(--border)] text-text-muted hover:border-text-dim"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Дата (опционально)</label>
              <input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пробег, км (опц.)</label>
              <input type="number" value={form.dueMileage} onChange={(e) => update("dueMileage", e.target.value)} className="input-field text-sm" min={0} placeholder="0" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить напоминание
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
