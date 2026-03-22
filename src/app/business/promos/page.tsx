"use client";

import { useEffect, useState, useCallback } from "react";
import { Ticket, Plus, Trash2, Percent, Calendar, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Promo {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const defaultForm = { code: "", description: "", discountPercent: 10, maxUses: 100, expiresAt: "" };

export default function BusinessPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/business/promos");
    const data = await res.json();
    setPromos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleCreate = async () => {
    if (!form.code.trim() || form.discountPercent < 1 || form.discountPercent > 50) return;
    setSaving(true);
    await fetch("/api/business/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: form.code.toUpperCase().trim(),
        expiresAt: form.expiresAt || null,
      }),
    });
    setForm(defaultForm);
    setShowForm(false);
    await fetchPromos();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/business/promos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchPromos();
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleToggleActive = async (promo: Promo) => {
    setToggling(promo.id);
    try {
      const res = await fetch("/api/business/promos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoId: promo.id, active: !promo.active }),
      });
      if (!res.ok) {
        toast("Не удалось обновить статус", "error");
        return;
      }
      toast(promo.active ? "Промокод деактивирован" : "Промокод активирован", "success");
      await fetchPromos();
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Промокоды</h1>
          <p className="text-sm text-text-muted mt-1">Создавайте и управляйте скидочными кодами</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Создать
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card-surface !p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text">Новый промокод</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Код</label>
              <input
                className="input-field w-full uppercase"
                placeholder="SUMMER2026"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Описание</label>
              <input
                className="input-field w-full"
                placeholder="Летняя скидка"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Скидка (%)</label>
              <input
                type="number"
                min={1}
                max={50}
                className="input-field w-full"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Макс. использований</label>
              <input
                type="number"
                min={1}
                className="input-field w-full"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Истекает (необязательно)</label>
              <input
                type="date"
                className="input-field w-full"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={saving || !form.code.trim()}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Создать промокод"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(defaultForm); }}
              className="btn-secondary text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Promo list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <div className="card-surface text-center py-12">
          <Ticket className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">Промокодов пока нет</p>
          <p className="text-xs text-text-dim mt-1">Создайте первый промокод для ваших клиентов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((p) => (
            <div key={p.id} className="card-surface !p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-text tracking-wider">{p.code}</span>
                    <button
                      onClick={() => copyCode(p.id, p.code)}
                      className="p-1 rounded hover:bg-brand/10 transition-colors"
                      title="Скопировать"
                    >
                      {copiedId === p.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-text-dim" />
                      )}
                    </button>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.active
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-red-400 bg-red-500/10"
                      }`}
                    >
                      {p.active ? "Активен" : "Неактивен"}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-text-muted mt-1">{p.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-text-dim mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      {p.discountPercent}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      {p.usedCount}/{p.maxUses}
                    </span>
                    {p.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        до {new Date(p.expiresAt).toLocaleDateString("ru-RU")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(p)}
                    disabled={toggling === p.id}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                      p.active
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-prussian/[0.06] text-text-dim hover:bg-prussian/[0.12]"
                    }`}
                    title={p.active ? "Деактивировать" : "Активировать"}
                  >
                    {p.active ? "Активен" : "Неактивен"}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
