"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export default function BusinessSchedulePage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchSlots = async () => {
    const res = await fetch("/api/business/schedule");
    const data = await res.json();
    setSlots(data.timeSlots || []);
    setHours(data.hours || "");
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const addSlot = async () => {
    if (!newTime) return;
    setAdding(true);
    await fetch("/api/business/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: newTime, available: true }),
    });
    setNewTime("");
    await fetchSlots();
    setAdding(false);
  };

  const toggleSlot = async (slot: TimeSlot) => {
    await fetch("/api/business/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: slot.time, available: !slot.available }),
    });
    await fetchSlots();
  };

  const deleteSlot = async (slotId: string) => {
    await fetch("/api/business/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    await fetchSlots();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Расписание</h1>
        <p className="text-sm text-text-muted mt-1">
          Управляйте слотами записи. Режим работы: <span className="text-text font-medium">{hours || "не указан"}</span>
        </p>
      </div>

      {/* Add Slot */}
      <div className="card-surface !p-4">
        <h3 className="text-sm font-semibold text-text mb-3">Добавить слот</h3>
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
      </div>

      {/* Slots Grid */}
      {slots.length === 0 ? (
        <div className="card-surface text-center py-12">
          <Clock className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">Слоты не настроены</p>
          <p className="text-xs text-text-dim mt-1">Добавьте временные слоты для записи клиентов</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`card-surface !p-3 text-center relative group transition-all ${
                slot.available
                  ? "border-emerald-500/20"
                  : "border-red-500/20 opacity-60"
              }`}
            >
              <p className="text-lg font-bold text-text">{slot.time}</p>
              <p className={`text-[10px] font-medium mt-1 ${
                slot.available ? "text-emerald-400" : "text-red-400"
              }`}>
                {slot.available ? "Доступен" : "Закрыт"}
              </p>

              <div className="flex items-center justify-center gap-1 mt-2">
                <button
                  onClick={() => toggleSlot(slot)}
                  className="p-1.5 rounded-lg hover:bg-prussian/[0.06] transition-colors"
                  title={slot.available ? "Закрыть слот" : "Открыть слот"}
                >
                  {slot.available ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-red-400" />
                  )}
                </button>
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Удалить слот"
                >
                  <Trash2 className="w-3.5 h-3.5 text-text-dim hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
