"use client";

import { useEffect, useState } from "react";
import { Save, Building2, MapPin, Phone, Clock, FileText, Tag, Wrench, CheckCircle2 } from "lucide-react";

interface ServiceSettings {
  name: string;
  type: string;
  typeName: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  hours: string;
  description: string;
  priceFrom: number;
  tags: string[];
  services: string[];
  verified: boolean;
}

export default function BusinessSettingsPage() {
  const [form, setForm] = useState<ServiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  useEffect(() => {
    fetch("/api/business/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, []);

  const updateField = (field: string, value: unknown) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
    setSaved(false);
  };

  const addTag = () => {
    if (!form || !tagInput.trim()) return;
    updateField("tags", [...form.tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (idx: number) => {
    if (!form) return;
    updateField("tags", form.tags.filter((_, i) => i !== idx));
  };

  const addService = () => {
    if (!form || !serviceInput.trim()) return;
    updateField("services", [...form.services, serviceInput.trim()]);
    setServiceInput("");
  };

  const removeService = (idx: number) => {
    if (!form) return;
    updateField("services", form.services.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    await fetch("/api/business/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Настройки сервиса</h1>
          <p className="text-sm text-text-muted mt-1">Информация, видимая клиентам</p>
        </div>
        {form.verified && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Верифицирован
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <div className="card-surface space-y-4">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" /> Основная информация
          </h2>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Название</label>
            <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="input-field text-sm" />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Описание</label>
            <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className="input-field text-sm min-h-[100px] resize-none" />
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Мин. цена (от)</label>
            <input type="number" value={form.priceFrom} onChange={(e) => updateField("priceFrom", parseInt(e.target.value) || 0)} className="input-field text-sm max-w-[200px]" />
          </div>
        </div>

        {/* Contact & Location */}
        <div className="card-surface space-y-4">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand" /> Контакты и адрес
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="input-field text-sm !pl-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Режим работы</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input type="text" value={form.hours} onChange={(e) => updateField("hours", e.target.value)} className="input-field text-sm !pl-10" placeholder="09:00 – 18:00" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Адрес</label>
            <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} className="input-field text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Район</label>
              <input type="text" value={form.district} onChange={(e) => updateField("district", e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Город</label>
              <input type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)} className="input-field text-sm" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card-surface space-y-3">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand" /> Теги
          </h2>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag, i) => (
              <span key={i} className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full flex items-center gap-1.5">
                {tag}
                <button onClick={() => removeTag(i)} className="hover:text-red-400 transition-colors">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="input-field text-sm flex-1" placeholder="Добавить тег..." />
            <button onClick={addTag} className="btn-secondary text-sm">+</button>
          </div>
        </div>

        {/* Services List */}
        <div className="card-surface space-y-3">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Wrench className="w-4 h-4 text-brand" /> Услуги
          </h2>
          <div className="flex flex-wrap gap-2">
            {form.services.map((svc, i) => (
              <span key={i} className="text-xs bg-prussian/[0.04] text-text-muted px-2.5 py-1 rounded-full flex items-center gap-1.5">
                {svc}
                <button onClick={() => removeService(i)} className="hover:text-red-400 transition-colors">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())} className="input-field text-sm flex-1" placeholder="Добавить услугу..." />
            <button onClick={addService} className="btn-secondary text-sm">+</button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Сохраняем...
            </span>
          ) : saved ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Сохранено!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Сохранить изменения
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
