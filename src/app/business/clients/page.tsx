"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Repeat2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  city: string | null;
  registeredAt: string;
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  lastVisit: string;
  firstVisit: string;
  cars: string[];
  recentServices: string[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchClients = (q: string) => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}` : "";
    fetch(`/api/business/clients${params}`)
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients(search);
  }, [search]);

  const totalVisits = clients.reduce((s, c) => s + c.totalVisits, 0);
  const repeatClients = clients.filter((c) => c.totalVisits > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">База клиентов</h1>
        <p className="text-text-muted text-sm mt-1">
          История визитов и контактная информация ваших клиентов
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-text">{clients.length}</p>
            <p className="text-xs text-text-muted">Всего клиентов</p>
          </div>
        </div>
        <div className="card-surface !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Repeat2 className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-text">{repeatClients}</p>
            <p className="text-xs text-text-muted">Повторных</p>
          </div>
        </div>
        <div className="card-surface !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
            <Calendar className="w-4.5 h-4.5 text-brand" />
          </div>
          <div>
            <p className="text-xl font-bold text-text">{totalVisits}</p>
            <p className="text-xs text-text-muted">Всего визитов</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск по имени, телефону, email или автомобилю..."
          className="input-field text-sm !pl-10 w-full"
        />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="card-surface text-center py-12">
          <Users className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">
            {searchInput ? "Клиенты не найдены" : "У вас пока нет клиентов"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const isExpanded = expandedId === client.id;
            return (
              <div key={client.id} className="card-surface !p-0 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : client.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-prussian/[0.02] transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{client.name}</p>
                    <p className="text-xs text-text-dim truncate">
                      {client.cars.join(" · ")}
                    </p>
                  </div>

                  {/* Visit count badge */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      client.totalVisits > 3
                        ? "bg-emerald-500/10 text-emerald-400"
                        : client.totalVisits > 1
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-prussian/[0.06] text-text-muted"
                    }`}>
                      {client.totalVisits} {(() => { const n = client.totalVisits % 100; const n1 = n % 10; if (n > 10 && n < 20) return "визитов"; if (n1 === 1) return "визит"; if (n1 >= 2 && n1 <= 4) return "визита"; return "визитов"; })()}
                    </span>
                    <span className="text-xs text-text-dim">
                      {new Date(client.lastVisit).toLocaleDateString("ru-RU")}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-dim" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-dim" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-text-dim" />
                          <a href={`tel:${client.phone}`} className="text-sm text-brand-light hover:text-brand transition-colors">
                            {client.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-text-dim" />
                        <a href={`mailto:${client.email}`} className="text-sm text-brand-light hover:text-brand transition-colors truncate">
                          {client.email}
                        </a>
                      </div>
                      {client.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-text-dim" />
                          <span className="text-sm text-text-muted">{client.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-text-dim" />
                        <span className="text-sm text-text-muted">
                          Первый визит: {new Date(client.firstVisit).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-text-dim" />
                        <span className="text-sm text-text-muted">
                          {client.cars.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-6 text-xs">
                      <span className="text-emerald-400">
                        Выполнено: {client.completedVisits}
                      </span>
                      {client.cancelledVisits > 0 && (
                        <span className="text-red-400">
                          Отменено: {client.cancelledVisits}
                        </span>
                      )}
                      {client.recentServices.length > 0 && (
                        <span className="text-text-dim">
                          Услуги: {client.recentServices.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
