"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Search,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Shield,
  Filter,
  Loader2,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  X,
  Plus,
  Phone,
  FileText,
  DollarSign,
  CheckCircle,
  Map,
  List,
} from "lucide-react";
import ServiceMap from "@/components/ui/ServiceMap";

type ServiceType = "sto" | "wash" | "tires" | "detailing" | "master" | "electric";
type ViewMode = "list" | "map";

const serviceTypeColors: Record<string, string> = {
  sto: "bg-brand/10 text-brand border-brand/15",
  wash: "bg-sky-500/10 text-sky-600 border-sky-500/15",
  tires: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15",
  detailing: "bg-purple-500/10 text-purple-600 border-purple-500/15",
  master: "bg-accent/10 text-accent-dark border-accent/15",
  electric: "bg-yellow-500/10 text-yellow-600 border-yellow-500/15",
};

const typeFilters: { value: ServiceType | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "sto", label: "СТО" },
  { value: "tires", label: "Шиномонтаж" },
  { value: "wash", label: "Мойка" },
  { value: "detailing", label: "Детейлинг" },
  { value: "master", label: "Мастера" },
  { value: "electric", label: "Электрик" },
];

const districts = ["Все районы", "Ленинский", "Самарский", "Октябрьский", "Железнодорожный", "Советский", "Промышленный", "Кировский", "Красноглинский", "Куйбышевский", "По всей Самаре"];

interface ServiceItem {
  id: string;
  name: string;
  type: string;
  typeName: string;
  rating: number;
  reviewCount: number;
  address: string;
  district: string;
  hours: string;
  image: string;
  tags: string;
  priceFrom: number;
  verified: boolean;
  featured?: boolean;
  lat?: number | null;
  lng?: number | null;
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ServiceType | "all">("all");
  const [districtFilter, setDistrictFilter] = useState("Все районы");
  const [minRating, setMinRating] = useState(0);

  const [sortBy, setSortBy] = useState<"rating" | "price" | "reviews">("rating");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  // View mode: "list" (default) or "map"
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  // Highlighted service on map
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const activeFilterCount = [
    typeFilter !== "all",
    districtFilter !== "Все районы",
    minRating > 0,
    onlyVerified,
    onlyOpen,
    maxPrice > 0,
  ].filter(Boolean).length;

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (districtFilter !== "Все районы") params.set("district", districtFilter);
    if (minRating > 0) params.set("minRating", String(minRating));
    if (search) params.set("search", search);

    fetch(`/api/services?${params}`)
      .then((res) => res.json())
      .then((data) => {
        let filtered = data;
        if (onlyVerified) filtered = filtered.filter((s: ServiceItem) => s.verified);
        if (maxPrice > 0) filtered = filtered.filter((s: ServiceItem) => s.priceFrom <= maxPrice);
        if (onlyOpen) {
          const now = new Date();
          const hours = now.getHours();
          filtered = filtered.filter((s: ServiceItem) => {
            const match = s.hours.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
            if (!match) return true;
            const open = parseInt(match[1]);
            const close = parseInt(match[3]);
            return hours >= open && hours < close;
          });
        }
        if (sortBy === "rating") filtered.sort((a: ServiceItem, b: ServiceItem) => b.rating - a.rating);
        else if (sortBy === "price") filtered.sort((a: ServiceItem, b: ServiceItem) => a.priceFrom - b.priceFrom);
        else if (sortBy === "reviews") filtered.sort((a: ServiceItem, b: ServiceItem) => b.reviewCount - a.reviewCount);
        setServices(filtered);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [typeFilter, districtFilter, minRating, search, onlyVerified, onlyOpen, maxPrice, sortBy]);

  const clearAllFilters = () => {
    setTypeFilter("all");
    setDistrictFilter("Все районы");
    setMinRating(0);
    setOnlyVerified(false);
    setOnlyOpen(false);
    setMaxPrice(0);
    setSortBy("rating");
    setSearch("");
  };

  const parseTags = (tags: string): string[] => {
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Каталог сервисов</h1>
          <p className="text-text-muted">Проверенные сервисы в Самаре</p>
        </div>
        {session?.user && (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Добавить сервис
          </button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="space-y-3 mb-5">
        {/* Row 1: search + district + rating */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input
              className="input-field pl-12"
              placeholder="Поиск по названию, адресу или специализации..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="glass rounded-xl px-4 py-2 text-sm text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d} value={d} className="bg-white">
                {d}
              </option>
            ))}
          </select>
          <select
            className="glass rounded-xl px-4 py-2 text-sm text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value={0} className="bg-white">Любой рейтинг</option>
            <option value={4} className="bg-white">от 4.0 ★</option>
            <option value={4.5} className="bg-white">от 4.5 ★</option>
            <option value={4.8} className="bg-white">от 4.8 ★</option>
          </select>
        </div>

        {/* Row 2: type pills + advanced toggle + view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                typeFilter === f.value
                  ? "bg-brand text-white shadow-brand"
                  : "glass text-text-muted hover:text-prussian hover:bg-prussian/[0.06]"
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="w-px h-6 bg-[var(--border)] mx-1 hidden sm:block" />

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              showAdvanced || activeFilterCount > 0
                ? "bg-brand/10 text-brand border border-brand/20"
                : "glass text-text-muted hover:text-text"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Ещё
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-brand text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Avito-style view toggle — pushed to the right */}
          <div className="ml-auto flex items-center">
            <div
              className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden"
              style={{ background: "var(--bg-card)" }}
            >
              <button
                onClick={() => setViewMode("list")}
                title="Список"
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-brand text-white"
                    : "text-text-muted hover:text-text hover:bg-[var(--hover-bg)]"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Список</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                title="Карта"
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === "map"
                    ? "bg-brand text-white"
                    : "text-text-muted hover:text-text hover:bg-[var(--hover-bg)]"
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Карта</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--ghost-bg)]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-text-dim" />
              <select
                className="bg-transparent text-sm text-text focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "rating" | "price" | "reviews")}
              >
                <option value="rating">По рейтингу</option>
                <option value="price">По цене ↑</option>
                <option value="reviews">По отзывам</option>
              </select>
            </div>

            <div className="w-px h-6 bg-[var(--border)]" />

            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Цена до:</span>
              <select
                className="bg-transparent text-sm text-text focus:outline-none"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              >
                <option value={0}>Любая</option>
                <option value={1000}>1 000 ₽</option>
                <option value={2000}>2 000 ₽</option>
                <option value={3000}>3 000 ₽</option>
                <option value={5000}>5 000 ₽</option>
              </select>
            </div>

            <div className="w-px h-6 bg-[var(--border)]" />

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                onlyVerified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Проверенные
            </button>

            <button
              onClick={() => setOnlyOpen(!onlyOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                onlyOpen
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Clock className="w-4 h-4" />
              Открыто сейчас
            </button>

            {activeFilterCount > 0 && (
              <>
                <div className="w-px h-6 bg-[var(--border)]" />
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Сбросить всё
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-text-muted text-sm">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Загрузка...
            </span>
          ) : (
            <>
              Найдено: <span className="text-text font-medium">{services.length}</span> сервисов
            </>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      {!loading && (
        <>
          {/* ══ MODE 1: LIST ══ */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {/* Mini map thumbnail */}
              {services.length > 0 && (
                <div
                  className="rounded-xl overflow-hidden border border-[var(--border)] w-full"
                  style={{ height: 200 }}
                >
                  <ServiceMap services={services} selectedId={selectedServiceId} />
                </div>
              )}

              {/* Full-width service cards */}
              {services.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => {
                    const tags = parseTags(service.tags);
                    return (
                      <Link href={`/services/${service.id}`} key={service.id}>
                        <div className="card-surface hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 cursor-pointer group flex flex-col sm:flex-row gap-4">
                          {/* Image */}
                          <div className="h-44 sm:h-auto sm:w-48 rounded-xl overflow-hidden bg-bg-elevated flex-shrink-0 relative">
                            <Image
                              src={service.image}
                              alt={service.name}
                              className="object-cover"
                              fill
                              sizes="(max-width: 640px) 100vw, 192px"
                            />
                            {service.featured && (
                              <div className="absolute top-3 left-3 tag-brand text-xs">Топ</div>
                            )}
                            {service.verified ? (
                              <div className="absolute top-3 right-3 flex items-center gap-1 glass px-2 py-1 rounded-lg text-xs text-emerald-400">
                                <Shield className="w-3 h-3" />
                                Партнёр
                              </div>
                            ) : (
                              <div className="absolute top-3 right-3 flex items-center gap-1 glass px-2 py-1 rounded-lg text-xs text-text-dim">
                                От&nbsp;пользователей
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-text group-hover:text-prussian transition-colors line-clamp-1">
                                {service.name}
                              </h3>
                              <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-brand-light group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2 mt-0.5" />
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                              <span className={`tag text-xs ${serviceTypeColors[service.type] || ""}`}>
                                {service.typeName}
                              </span>
                              <div className="flex items-center gap-1 text-sm ml-auto">
                                <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                                <span className="font-semibold text-text">{service.rating}</span>
                                <span className="text-text-dim">({service.reviewCount})</span>
                              </div>
                            </div>

                            <div className="space-y-1 mb-2 text-sm text-text-muted">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{service.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{service.hours}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-prussian/[0.05] text-text-muted text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="text-sm text-text-muted">
                                от <span className="text-text font-semibold">{service.priceFrom.toLocaleString("ru")} ₽</span>
                              </div>
                              <button className="btn-primary text-sm py-2 px-4 pointer-events-none">
                                Записаться
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Filter className="w-12 h-12 text-text-dim mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text mb-2">Ничего не найдено</h3>
                  <p className="text-text-muted text-sm">Попробуйте изменить фильтры</p>
                </div>
              )}
            </div>
          )}

          {/* ══ MODE 2: MAP (full width) + cards below ══ */}
          {viewMode === "map" && (
            <div className="flex flex-col gap-4">
              {/* Full-width map */}
              <div
                className="w-full rounded-xl overflow-hidden border border-[var(--border)]"
                style={{ height: "calc(100vh - 320px)", minHeight: 400 }}
              >
                <ServiceMap services={services} selectedId={selectedServiceId} />
              </div>

              {/* 2-column card grid below map */}
              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Filter className="w-10 h-10 text-text-dim mb-3" />
                  <p className="text-text-muted text-sm">Ничего не найдено</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id === selectedServiceId ? null : service.id)}
                      className={`w-full text-left rounded-xl p-3 flex gap-3 transition-all duration-150 group border ${
                        selectedServiceId === service.id
                          ? "border-brand bg-brand/5"
                          : "border-[var(--border)] hover:border-brand/40"
                      }`}
                      style={{ background: selectedServiceId === service.id ? undefined : "var(--bg-card)" }}
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-[var(--ghost-bg)] overflow-hidden relative">
                        {service.image ? (
                          <Image src={service.image} alt={service.name} className="object-cover" fill sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-dim text-2xl">🔧</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-sm font-semibold text-text line-clamp-2 leading-snug flex-1">
                            {service.name}
                          </span>
                          <Link href={`/services/${service.id}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                            <ChevronRight className="w-4 h-4 text-text-dim hover:text-brand transition-colors" />
                          </Link>
                        </div>

                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${serviceTypeColors[service.type] || ""}`}>
                            {service.typeName}
                          </span>
                          <div className="flex items-center gap-0.5 text-[11px]">
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <span className="font-semibold text-text">{service.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-text-muted mb-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">{service.address}</span>
                        </div>

                        <div className="text-xs text-text-muted">
                          от <span className="text-text font-medium">{service.priceFrom.toLocaleString("ru")} ₽</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showSuggestModal && (
        <SuggestServiceModal onClose={() => setShowSuggestModal(false)} />
      )}
    </AppLayout>
  );
}

// ── Suggest Service Modal ──────────────────────────────────────────────────────

const typeOptions: { value: ServiceType; label: string }[] = [
  { value: "sto", label: "Автосервис (СТО)" },
  { value: "wash", label: "Автомойка" },
  { value: "tires", label: "Шиномонтаж" },
  { value: "detailing", label: "Детейлинг" },
  { value: "master", label: "Частный мастер" },
  { value: "electric", label: "Автоэлектрик" },
];

const districtOptions = [
  "Ленинский",
  "Самарский",
  "Октябрьский",
  "Железнодорожный",
  "Советский",
  "Промышленный",
  "Кировский",
  "Красноглинский",
  "Куйбышевский",
];

function SuggestServiceModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    type: "" as ServiceType | "",
    address: "",
    district: "",
    phone: "",
    hours: "",
    description: "",
    priceFrom: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.type || !form.address || !form.district || !form.phone) {
      setError("Заполните все обязательные поля");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/services/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceFrom: form.priceFrom ? parseInt(form.priceFrom) : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при отправке");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Спасибо!</h3>
          <p className="text-text-muted mb-6">
            Сервис отправлен на модерацию. После проверки он появится в каталоге.
          </p>
          <button onClick={onClose} className="btn-primary w-full">
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold text-text">Добавить сервис</h2>
            <p className="text-sm text-text-muted mt-0.5">Предложите новый сервис для каталога</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--hover-bg)] transition-colors"
          >
            <X className="w-5 h-5 text-text-dim" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Название <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              placeholder="Например: АвтоМастер"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Тип сервиса <span className="text-red-400">*</span>
            </label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
            >
              <option value="" className="bg-[var(--bg-card)]">Выберите тип...</option>
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value} className="bg-[var(--bg-card)]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Адрес <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                className="input-field pl-10"
                placeholder="ул. Ленинская, 10"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Район <span className="text-red-400">*</span>
            </label>
            <select
              className="input-field"
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
            >
              <option value="" className="bg-[var(--bg-card)]">Выберите район...</option>
              {districtOptions.map((d) => (
                <option key={d} value={d} className="bg-[var(--bg-card)]">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Телефон <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                className="input-field pl-10"
                placeholder="+7 (846) 000-00-00"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Часы работы
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                className="input-field pl-10"
                placeholder="09:00 – 20:00"
                value={form.hours}
                onChange={(e) => update("hours", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Описание
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-text-dim" />
              <textarea
                className="input-field pl-10 min-h-[80px] resize-none"
                placeholder="Краткое описание сервиса..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Цена от (₽)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                type="number"
                className="input-field pl-10"
                placeholder="500"
                value={form.priceFrom}
                onChange={(e) => update("priceFrom", e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border)] text-text-muted hover:bg-[var(--hover-bg)] transition-colors text-sm font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить на модерацию"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
