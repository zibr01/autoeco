"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarCheck, Filter, CheckCircle2, XCircle, Clock, AlertCircle, Phone, Car } from "lucide-react";

interface Booking {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string | null; phone: string | null };
  car: { make: string; model: string; year: number; licensePlate: string };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Ожидает", color: "text-amber-400", bg: "bg-amber-500/10" },
  confirmed: { label: "Подтверждена", color: "text-blue-400", bg: "bg-blue-500/10" },
  completed: { label: "Выполнена", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  cancelled: { label: "Отменена", color: "text-red-400", bg: "bg-red-500/10" },
};

const filters = [
  { value: "all", label: "Все" },
  { value: "pending", label: "Ожидают" },
  { value: "confirmed", label: "Подтверждены" },
  { value: "completed", label: "Выполнены" },
  { value: "cancelled", label: "Отменены" },
];

export default function BusinessBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/business/bookings?status=${filter}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    await fetch("/api/business/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    await fetchBookings();
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Записи клиентов</h1>
        <p className="text-sm text-text-muted mt-1">Управляйте записями на обслуживание</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-text-dim" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.value
                ? "bg-brand text-white"
                : "bg-prussian/[0.04] text-text-muted hover:text-text hover:bg-prussian/[0.08]"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-text-dim ml-2">{total} записей</span>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card-surface text-center py-12">
          <CalendarCheck className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">Записей не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const st = statusConfig[b.status] || statusConfig.pending;
            const isPending = b.status === "pending";
            const isConfirmed = b.status === "confirmed";
            const isUpdating = updating === b.id;

            return (
              <div key={b.id} className="card-surface !p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text">{b.user.name || "Клиент"}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color} ${st.bg}`}>
                        {st.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted mt-1.5">
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        {b.car.make} {b.car.model} ({b.car.year})
                      </span>
                      {b.car.licensePlate && (
                        <span className="text-text-dim">{b.car.licensePlate}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        {new Date(b.date).toLocaleDateString("ru-RU")} в {b.time}
                      </span>
                      {b.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {b.user.phone}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-dim mt-1.5">
                      <span className="text-text-muted font-medium">Услуга:</span> {b.serviceType}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPending && (
                      <>
                        <button
                          onClick={() => updateStatus(b.id, "confirmed")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Подтвердить
                        </button>
                        <button
                          onClick={() => updateStatus(b.id, "cancelled")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Отменить
                        </button>
                      </>
                    )}
                    {isConfirmed && (
                      <button
                        onClick={() => updateStatus(b.id, "completed")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Выполнено
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
