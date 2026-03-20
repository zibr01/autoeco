"use client";

import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Search, X, Star, MapPin, Phone, Clock, Shield, ChevronRight, Scale,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Service {
  id: string;
  name: string;
  type: string;
  typeName: string;
  rating: number;
  reviewCount: number;
  address: string;
  district: string;
  phone: string;
  hours: string;
  image: string;
  tags: string;
  priceFrom: number;
  verified: boolean;
}

export default function ComparePage() {
  const [selected, setSelected] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Service[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/services?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(
          (data as Service[]).filter((s) => !selected.some((sel) => sel.id === s.id))
        );
        setShowDropdown(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const add = (s: Service) => {
    if (selected.length >= 3) return;
    setSelected((prev) => [...prev, s]);
    setQuery("");
    setShowDropdown(false);
  };

  const remove = (id: string) => setSelected((prev) => prev.filter((s) => s.id !== id));

  const rows: { label: string; icon: React.ReactNode; render: (s: Service) => React.ReactNode }[] = [
    {
      label: "Тип",
      icon: <Scale className="w-4 h-4" />,
      render: (s) => s.typeName,
    },
    {
      label: "Рейтинг",
      icon: <Star className="w-4 h-4" />,
      render: (s) => (
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{s.rating.toFixed(1)}</span>
          <span className="text-text-muted text-sm">({s.reviewCount})</span>
        </span>
      ),
    },
    {
      label: "Адрес",
      icon: <MapPin className="w-4 h-4" />,
      render: (s) => s.address,
    },
    {
      label: "Телефон",
      icon: <Phone className="w-4 h-4" />,
      render: (s) => s.phone || "—",
    },
    {
      label: "Часы работы",
      icon: <Clock className="w-4 h-4" />,
      render: (s) => s.hours || "—",
    },
    {
      label: "Цена от",
      icon: <ChevronRight className="w-4 h-4" />,
      render: (s) =>
        s.priceFrom ? (
          <span className="font-semibold text-brand">{s.priceFrom.toLocaleString()} ₽</span>
        ) : "—",
    },
    {
      label: "Проверен",
      icon: <Shield className="w-4 h-4" />,
      render: (s) =>
        s.verified ? (
          <span className="flex items-center gap-1 text-green-500">
            <Shield className="w-4 h-4 fill-green-500/20" /> Да
          </span>
        ) : (
          <span className="text-text-dim">Нет</span>
        ),
    },
    {
      label: "Теги",
      icon: null,
      render: (s) => {
        try {
          const parsed = typeof s.tags === "string" ? JSON.parse(s.tags) : s.tags;
          return parsed?.length ? (
            <span className="text-sm text-text-muted">{parsed.join(", ")}</span>
          ) : "—";
        } catch { return "—"; }
      },
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Scale className="w-7 h-7 text-brand" />
          <h1 className="text-2xl font-bold text-text">Сравнение сервисов</h1>
        </div>

        {/* Search */}
        <div ref={wrapperRef} className="relative max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input
              className="input-field pl-10 w-full"
              placeholder="Найти сервис для сравнения..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length && setShowDropdown(true)}
              disabled={selected.length >= 3}
            />
          </div>
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 mt-1 w-full card-surface shadow-xl rounded-xl max-h-64 overflow-y-auto">
              {results.map((s) => (
                <button
                  key={s.id}
                  onClick={() => add(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand/10 transition text-left"
                >
                  {s.image && (
                    <Image
                      src={s.image}
                      alt={s.name}
                      width={40}
                      height={40}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="text-text font-medium text-sm">{s.name}</p>
                    <p className="text-text-dim text-xs">{s.typeName} · {s.district}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && selected.length < 2 && (
          <p className="text-text-muted text-sm">Добавьте ещё сервис для сравнения</p>
        )}

        {/* Empty state */}
        {selected.length === 0 && (
          <div className="card-surface rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
              <Search className="w-8 h-8 text-brand" />
            </div>
            <p className="text-text-muted text-lg">Добавьте сервисы для сравнения</p>
            <p className="text-text-dim text-sm">Можно сравнить до 3 сервисных центров</p>
          </div>
        )}

        {/* Comparison table */}
        {selected.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block card-surface rounded-2xl overflow-hidden">
              <table className="w-full">
                {/* Header row — service cards */}
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 text-left text-text-dim text-sm font-medium w-40">Сервис</th>
                    {selected.map((s) => (
                      <th key={s.id} className="p-4 text-left">
                        <div className="flex items-start gap-3">
                          {s.image && (
                            <Image
                              src={s.image}
                              alt={s.name}
                              width={56}
                              height={56}
                              className="rounded-xl object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/services/${s.id}`}
                                className="text-text font-semibold hover:text-brand transition truncate"
                              >
                                {s.name}
                              </Link>
                              <button
                                onClick={() => remove(s.id)}
                                className="shrink-0 p-1 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-400 transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? "bg-white/[0.02]" : ""}
                    >
                      <td className="px-4 py-3 text-text-dim text-sm font-medium">
                        <span className="flex items-center gap-2">
                          {row.icon}
                          {row.label}
                        </span>
                      </td>
                      {selected.map((s) => (
                        <td key={s.id} className="px-4 py-3 text-text text-sm">
                          {row.render(s)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Detail link row */}
                  <tr className="border-t border-white/5">
                    <td className="px-4 py-3" />
                    {selected.map((s) => (
                      <td key={s.id} className="px-4 py-3">
                        <Link
                          href={`/services/${s.id}`}
                          className="btn-primary inline-flex items-center gap-1 text-sm px-4 py-2 rounded-xl"
                        >
                          Подробнее <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile — stacked cards */}
            <div className="md:hidden space-y-4">
              {selected.map((s) => (
                <div key={s.id} className="card-surface rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {s.image && (
                      <Image
                        src={s.image}
                        alt={s.name}
                        width={48}
                        height={48}
                        className="rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-text font-semibold truncate">{s.name}</p>
                      <p className="text-text-dim text-xs">{s.typeName}</p>
                    </div>
                    <button
                      onClick={() => remove(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-400 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {rows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-2 text-sm">
                        <span className="text-text-dim flex items-center gap-1.5 shrink-0">
                          {row.icon} {row.label}
                        </span>
                        <span className="text-text text-right">{row.render(s)}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/services/${s.id}`}
                    className="btn-secondary flex items-center justify-center gap-1 text-sm py-2 rounded-xl"
                  >
                    Подробнее <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
