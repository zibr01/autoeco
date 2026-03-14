"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
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
} from "lucide-react";

const tabs = ["Журнал ТО", "Напоминания", "Документы"] as const;
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
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Журнал ТО");
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showEditCar, setShowEditCar] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="h-56 md:h-auto rounded-xl overflow-hidden bg-bg-elevated">
            <img
              src={car.image}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
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
                <span>{car.mileage.toLocaleString("ru")} км</span>
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
      <div className="flex gap-2 mb-6 glass p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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

      {activeTab === "Напоминания" && (
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
      )}

      {activeTab === "Документы" && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: "ОСАГО",
              value: "ВВВ 1234567890",
              expires: "01.06.2025",
              status: "active",
              icon: Shield,
            },
            {
              title: "Технический осмотр",
              value: "78 МО 123456",
              expires: "20.05.2025",
              status: car.health < 70 ? "warning" : "active",
              icon: CheckCircle2,
            },
            {
              title: "СТС (Свидетельство о регистрации)",
              value: car.licensePlate,
              expires: null,
              status: "active",
              icon: FileText,
            },
            {
              title: "Диагностическая карта",
              value: "ДК-2024-XXXXX",
              expires: "20.05.2026",
              status: "active",
              icon: FileText,
            },
          ].map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.title}
                className={`rounded-2xl p-5 border ${
                  doc.status === "warning"
                    ? "bg-accent/10 border-accent/20"
                    : "bg-bg-card border-prussian/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-brand-light" />
                  </div>
                  <span className="font-semibold text-text text-sm">{doc.title}</span>
                  {doc.status === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-accent ml-auto" />
                  )}
                </div>
                <div className="text-text-muted text-sm mt-1">{doc.value}</div>
                {doc.expires && (
                  <div className="text-xs text-text-dim mt-1">
                    Действует до: {doc.expires}
                  </div>
                )}
              </div>
            );
          })}

          <button className="rounded-2xl p-5 border border-dashed border-prussian/[0.12] hover:border-brand/40 hover:bg-brand/5 transition-all flex items-center gap-3 text-text-muted hover:text-brand-light">
            <div className="w-8 h-8 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-sm">Добавить документ</div>
          </button>
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
                  await fetch(`/api/cars/${car.id}`, { method: "DELETE" });
                  router.push("/garage");
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
