"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Zap,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Booking {
  id: string;
  time: string;
  status: string;
  date: string;
}

const QUICK_FILL_PRESETS = [
  { label: "Стандартный (9:00\u201318:00)", start: 9, end: 18, step: 60 },
  { label: "Расширенный (8:00\u201321:00)", start: 8, end: 21, step: 60 },
  { label: "Каждые 30 мин (9:00\u201318:00)", start: 9, end: 18, step: 30 },
];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function BusinessSchedulePage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    type: "toggle" | "clearAll";
    slot?: TimeSlot;
    message: string;
  } | null>(null);
  const [quickFilling, setQuickFilling] = useState(false);

  const { toast } = useToast();

  const fetchSlots = useCallback(async () => {
    const res = await fetch("/api/business/schedule");
    const data = await res.json();
    setSlots(data.timeSlots || []);
    setHours(data.hours || "");
    setLoading(false);
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/business/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(
          Array.isArray(data) ? data : data.bookings || data.data || []
        );
      }
    } catch {
      // bookings fetch is best-effort for conflict detection
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, [fetchSlots, fetchBookings]);

  const hasPendingBooking = (time: string): boolean => {
    return bookings.some(
      (b) =>
        b.time === time && (b.status === "pending" || b.status === "confirmed")
    );
  };

  const addSlot = async () => {
    if (!newTime) return;

    // Check if slot already exists
    if (slots.some((s) => s.time === newTime)) {
      toast("Слот на это время уже существует", "warning");
      return;
    }

    setAdding(true);
    await fetch("/api/business/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: newTime, available: true }),
    });
    toast(`Слот ${newTime} добавлен`, "success");
    setNewTime("");
    await fetchSlots();
    setAdding(false);
  };

  const toggleSlot = async (slot: TimeSlot) => {
    // If disabling, check for pending bookings
    if (slot.available && hasPendingBooking(slot.time)) {
      setConfirmAction({
        type: "toggle",
        slot,
        message: `На время ${slot.time} есть активная запись. Всё равно закрыть слот?`,
      });
      return;
    }
    await executeToggle(slot);
  };

  const executeToggle = async (slot: TimeSlot) => {
    await fetch("/api/business/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: slot.time, available: !slot.available }),
    });
    toast(
      slot.available
        ? `Слот ${slot.time} закрыт`
        : `Слот ${slot.time} открыт`,
      slot.available ? "warning" : "success"
    );
    await fetchSlots();
  };

  const deleteSlot = async (slotId: string, time: string) => {
    await fetch("/api/business/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    toast(`Слот ${time} удалён`, "info");
    await fetchSlots();
  };

  const quickFill = async (start: number, end: number, step: number) => {
    setQuickFilling(true);
    const times: string[] = [];
    for (let min = start * 60; min < end * 60; min += step) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      const t = formatTime(h, m);
      if (!slots.some((s) => s.time === t)) {
        times.push(t);
      }
    }

    // Create all new slots
    for (const time of times) {
      await fetch("/api/business/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, available: true }),
      });
    }

    toast(
      times.length > 0
        ? `Добавлено ${times.length} слотов`
        : "Все слоты из шаблона уже существуют",
      times.length > 0 ? "success" : "info"
    );
    await fetchSlots();
    setQuickFilling(false);
  };

  const clearAll = () => {
    if (slots.length === 0) return;
    setConfirmAction({
      type: "clearAll",
      message: `Удалить все ${slots.length} слотов? Это действие нельзя отменить.`,
    });
  };

  const executeClearAll = async () => {
    for (const slot of slots) {
      await fetch("/api/business/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id }),
      });
    }
    toast("Все слоты удалены", "info");
    await fetchSlots();
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "toggle" && confirmAction.slot) {
      await executeToggle(confirmAction.slot);
    } else if (confirmAction.type === "clearAll") {
      await executeClearAll();
    }
    setConfirmAction(null);
  };

  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );
  const availableCount = slots.filter((s) => s.available).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Расписание</h1>
          <p className="text-sm text-text-muted mt-1">
            Управляйте слотами записи. Режим работы:{" "}
            <span className="text-text font-medium">
              {hours || "не указан"}
            </span>
          </p>
        </div>
        {slots.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-medium text-emerald-400">
                Доступно: {availableCount} из {slots.length} слотов
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Slot + Quick Fill */}
      <div className="card-surface !p-4 space-y-4">
        <h3 className="text-sm font-semibold text-text">Добавить слот</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[200px]">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="input-field text-sm !pl-10"
            />
          </div>
          <button
            onClick={addSlot}
            disabled={adding || !newTime}
            className="btn-primary text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </button>
        </div>

        {/* Quick Fill */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-text-dim mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Быстрое заполнение
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILL_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => quickFill(preset.start, preset.end, preset.step)}
                disabled={quickFilling}
                className="text-xs px-3 py-1.5 rounded-lg border border-brand/20 bg-brand/5 text-brand hover:bg-brand/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={clearAll}
              disabled={slots.length === 0}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Очистить все
            </button>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      {sortedSlots.length === 0 ? (
        <div className="card-surface text-center py-12">
          <Clock className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">Слоты не настроены</p>
          <p className="text-xs text-text-dim mt-1">
            Добавьте временные слоты для записи клиентов или используйте быстрое
            заполнение
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedSlots.map((slot) => {
            const hasBooking = hasPendingBooking(slot.time);
            return (
              <div
                key={slot.id}
                className={`relative rounded-xl border p-3 text-center group transition-all ${
                  slot.available
                    ? "bg-emerald-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5"
                    : "bg-white/[0.02] border-white/5 opacity-60"
                }`}
              >
                {/* Booking indicator */}
                {hasBooking && (
                  <div className="absolute top-1.5 right-1.5">
                    <div
                      className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                      title="Есть активная запись"
                    />
                  </div>
                )}

                <p
                  className={`text-lg font-bold ${
                    slot.available
                      ? "text-text"
                      : "text-text-dim line-through decoration-red-400/50"
                  }`}
                >
                  {slot.time}
                </p>
                <span
                  className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    slot.available
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {slot.available ? "Открыт" : "Закрыт"}
                </span>

                <div className="flex items-center justify-center gap-1 mt-2">
                  <button
                    onClick={() => toggleSlot(slot)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      slot.available
                        ? "hover:bg-emerald-500/10"
                        : "hover:bg-red-500/10"
                    }`}
                    title={slot.available ? "Закрыть слот" : "Открыть слот"}
                  >
                    {slot.available ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-red-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSlot(slot.id, slot.time)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Удалить слот"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-text-dim hover:text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card-surface !p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">
                  Подтверждение
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {confirmAction.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="text-sm px-4 py-2 rounded-lg border border-white/10 text-text-muted hover:bg-white/5 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirm}
                className="text-sm px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                {confirmAction.type === "clearAll"
                  ? "Удалить все"
                  : "Закрыть слот"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
