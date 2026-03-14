"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

type ServiceType = "sto" | "wash" | "tires" | "detailing" | "master" | "electric";

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

const districts = ["Все районы", "Центральный", "Северный", "Южный", "Восточный", "Западный", "По всей Москве"];

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
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ServiceType | "all">("all");
  const [districtFilter, setDistrictFilter] = useState("Все районы");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (districtFilter !== "Все районы") params.set("district", districtFilter);
    if (minRating > 0) params.set("minRating", String(minRating));
    if (search) params.set("search", search);

    fetch(`/api/services?${params}`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [typeFilter, districtFilter, minRating, search]);

  const parseTags = (tags: string): string[] => {
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-1">Каталог сервисов</h1>
        <p className="text-text-muted">Проверенные сервисы в Москве</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4 mb-8">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
          <input
            className="input-field pl-12"
            placeholder="Поиск по названию, адресу или специализации..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
          {/* Type pills */}
          <div className="flex gap-2 flex-wrap">
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  typeFilter === f.value
                    ? "bg-brand text-white shadow-brand"
                    : "glass text-text-muted hover:text-prussian hover:bg-prussian/[0.06]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* District select */}
          <select
            className="glass rounded-xl px-4 py-2 text-sm text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-brand/50 sm:ml-auto"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d} value={d} className="bg-white">
                {d}
              </option>
            ))}
          </select>

          {/* Rating filter */}
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
      </div>

      {/* Results count */}
      <div className="text-text-muted text-sm mb-4">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Загрузка...
          </span>
        ) : (
          <>Найдено: <span className="text-text font-medium">{services.length}</span> сервисов</>
        )}
      </div>

      {/* Cards grid */}
      {!loading && services.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service) => {
            const tags = parseTags(service.tags);
            return (
              <Link href={`/services/${service.id}`} key={service.id}>
                <div className="card-surface hover:border-brand/30 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer group h-full flex flex-col">
                  {/* Image */}
                  <div className="h-44 rounded-xl overflow-hidden bg-bg-elevated mb-4 relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    {service.featured && (
                      <div className="absolute top-3 left-3 tag-brand text-xs">Топ</div>
                    )}
                    {service.verified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 glass px-2 py-1 rounded-lg text-xs text-emerald-400">
                        <Shield className="w-3 h-3" />
                        Проверен
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-text group-hover:text-prussian transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-brand-light group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2 mt-0.5" />
                    </div>

                    {/* Type + rating */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`tag text-xs ${serviceTypeColors[service.type] || ""}`}>
                        {service.typeName}
                      </span>
                      <div className="flex items-center gap-1 text-sm ml-auto">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        <span className="font-semibold text-text">{service.rating}</span>
                        <span className="text-text-dim">({service.reviewCount})</span>
                      </div>
                    </div>

                    {/* Address + hours */}
                    <div className="space-y-1.5 mb-3 text-sm text-text-muted">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{service.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{service.hours}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-prussian/[0.05] text-text-muted text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price + CTA */}
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
        !loading && (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">Ничего не найдено</h3>
            <p className="text-text-muted text-sm">Попробуйте изменить фильтры</p>
          </div>
        )
      )}
    </AppLayout>
  );
}
