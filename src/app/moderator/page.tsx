"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import AppLayout from "@/components/layout/AppLayout";
import {
  Shield,
  Plus,
  Loader2,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Users,
  Star,
  Trash2,
  Pencil,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  type: string;
  typeName: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  hours?: string;
  description?: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  ownerId: string | null;
}

type FilterTab = "all" | "verified" | "pending";

const serviceTypes = [
  { value: "sto", label: "СТО" },
  { value: "wash", label: "Автомойка" },
  { value: "tires", label: "Шиномонтаж" },
  { value: "detailing", label: "Детейлинг" },
  { value: "master", label: "Автомастер" },
  { value: "electric", label: "Автоэлектрик" },
  { value: "parts", label: "Запчасти" },
];

const districts = [
  "Железнодорожный", "Кировский", "Красноглинский", "Куйбышевский",
  "Ленинский", "Октябрьский", "Промышленный", "Самарский", "Советский",
];

export default function ModeratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userRole = (session?.user as { role?: string })?.role;
  const isAllowed = userRole === "MODERATOR" || userRole === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated" && !isAllowed) {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated" && isAllowed) {
      fetch("/api/moderator/services")
        .then((r) => r.json())
        .then((data) => setServices(Array.isArray(data) ? data : []))
        .catch(() => setServices([]))
        .finally(() => setLoading(false));
    }
  }, [status, isAllowed, router]);

  const toggleVerified = async (service: ServiceItem) => {
    setActionLoading(service.id);
    try {
      const res = await fetch("/api/moderator/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, verified: !service.verified }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setServices((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      toast(service.verified ? "Верификация снята" : "Сервис верифицирован", "success");
    } catch {
      toast("Ошибка при обновлении верификации", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeatured = async (service: ServiceItem) => {
    setActionLoading(service.id);
    try {
      const res = await fetch("/api/moderator/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, featured: !service.featured }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setServices((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      toast(service.featured ? "Убран из Featured" : "Добавлен в Featured", "success");
    } catch {
      toast("Ошибка при обновлении Featured", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteService = async (service: ServiceItem) => {
    if (!window.confirm(`Удалить "${service.name}"? Это действие нельзя отменить.`)) return;
    setActionLoading(service.id);
    try {
      const res = await fetch(`/api/moderator/services?id=${service.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      toast("Сервис удалён", "success");
    } catch {
      toast("Ошибка при удалении сервиса", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const verifiedCount = services.filter((s) => s.verified).length;
  const unverifiedCount = services.filter((s) => !s.verified).length;

  const filteredServices = services.filter((s) => {
    if (filterTab === "verified") return s.verified;
    if (filterTab === "pending") return !s.verified;
    return true;
  });

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "Все", count: services.length },
    { key: "verified", label: "Верифицированные", count: verifiedCount },
    { key: "pending", label: "На проверке", count: unverifiedCount },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-brand-light" />
          <h1 className="text-2xl font-bold text-text">Панель модератора</h1>
        </div>
        <p className="text-text-muted text-sm">Управление сервисами и филиалами</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4 text-center">
          <Building2 className="w-5 h-5 text-brand-light mx-auto mb-1" />
          <div className="text-2xl font-bold text-text">{services.length}</div>
          <div className="text-xs text-text-muted">Всего сервисов</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-emerald-400">{verifiedCount}</div>
          <div className="text-xs text-text-muted">Верифицированных</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="text-2xl font-bold text-accent">{unverifiedCount}</div>
          <div className="text-xs text-text-muted">От пользователей</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterTab === tab.key
                ? "bg-brand/20 text-brand-light border border-brand/30"
                : "glass text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filterTab === tab.key ? "bg-brand/30 text-brand-light" : "bg-white/5 text-text-dim"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary text-sm !py-2 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Добавить филиал
        </button>
      </div>

      {/* Services list */}
      <div className="space-y-2">
        {filteredServices.length === 0 && (
          <div className="glass rounded-xl p-8 text-center text-text-muted text-sm">
            Нет сервисов в этой категории
          </div>
        )}
        {filteredServices.map((service) => (
          <div key={service.id} className="card-surface">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setEditingService(service)}
              title="Нажмите для редактирования"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                service.verified ? "bg-emerald-500/20" : "bg-gray-500/20"
              }`}>
                <Building2 className={`w-5 h-5 ${service.verified ? "text-emerald-400" : "text-gray-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-text text-sm">{service.name}</span>
                  <span className="tag text-[10px]">{service.typeName}</span>
                  {service.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Верифицирован
                    </span>
                  )}
                  {service.featured && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> Featured
                    </span>
                  )}
                  {!service.verified && !service.ownerId && (
                    <span className="text-[10px] text-text-dim">Добавлен модератором</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-dim mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {service.address}
                  </span>
                  {service.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {service.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-text-dim flex-shrink-0">
                {service.rating > 0 && <span>{service.rating.toFixed(1)}</span>}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
              <button
                onClick={(e) => { e.stopPropagation(); toggleVerified(service); }}
                disabled={actionLoading === service.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  service.verified
                    ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
                    : "bg-white/5 text-text-muted hover:bg-white/10 border border-[var(--border)]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {service.verified ? "Снять верификацию" : "Верифицировать"}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); toggleFeatured(service); }}
                disabled={actionLoading === service.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  service.featured
                    ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20"
                    : "bg-white/5 text-text-muted hover:bg-white/10 border border-[var(--border)]"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${service.featured ? "fill-amber-400" : ""}`} />
                Featured
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setEditingService(service); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-muted hover:bg-white/10 border border-[var(--border)] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Изменить
              </button>

              <div className="flex-1" />

              <button
                onClick={(e) => { e.stopPropagation(); deleteService(service); }}
                disabled={actionLoading === service.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add service modal */}
      {showAddForm && (
        <ServiceFormModal
          title="Добавить филиал"
          submitLabel="Добавить филиал"
          onClose={() => setShowAddForm(false)}
          onSubmit={async (formData) => {
            const res = await fetch("/api/moderator/services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
            });
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || "Ошибка при добавлении");
            }
            const service = await res.json();
            setServices((prev) => [...prev, service]);
            toast("Филиал успешно добавлен", "success");
          }}
        />
      )}

      {/* Edit service modal */}
      {editingService && (
        <ServiceFormModal
          title="Редактировать сервис"
          submitLabel="Сохранить изменения"
          initialData={editingService}
          onClose={() => setEditingService(null)}
          onSubmit={async (formData) => {
            const res = await fetch("/api/moderator/services", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editingService.id, ...formData }),
            });
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || "Ошибка при сохранении");
            }
            const updated = await res.json();
            setServices((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
            toast("Сервис успешно обновлён", "success");
          }}
        />
      )}
    </AppLayout>
  );
}

function ServiceFormModal({
  title,
  submitLabel,
  initialData,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  initialData?: ServiceItem;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    type: initialData?.type ?? "sto",
    address: initialData?.address ?? "",
    district: initialData?.district ?? "",
    city: initialData?.city ?? "Самара",
    phone: initialData?.phone ?? "",
    hours: initialData?.hours ?? "",
    description: initialData?.description ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.address.trim()) {
      setError("Название и адрес обязательны");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">{title}</h2>
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

          {!initialData && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs text-amber-400">
                Филиал будет добавлен как <strong>незарегистрированный</strong>. Для верификации владелец должен зарегистрироваться как бизнес.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Название *</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field text-sm" placeholder="Автосервис Профи" required />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Тип *</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className="input-field text-sm">
              {serviceTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Адрес *</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field text-sm" placeholder="ул. Ленина, 15" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Район</label>
              <select value={form.district} onChange={(e) => update("district", e.target.value)} className="input-field text-sm">
                <option value="">Не указан</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Город</label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className="input-field text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Телефон</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-field text-sm" placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Часы работы</label>
              <input type="text" value={form.hours} onChange={(e) => update("hours", e.target.value)} className="input-field text-sm" placeholder="9:00 - 20:00" />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Описание</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field text-sm min-h-[60px] resize-none" placeholder="Краткое описание..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохраняем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {initialData ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {submitLabel}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
