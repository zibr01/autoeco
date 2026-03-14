"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, AlertCircle, Wrench } from "lucide-react";

const serviceTypes = [
  { value: "sto", label: "Автосервис" },
  { value: "wash", label: "Автомойка" },
  { value: "tires", label: "Шиномонтаж" },
  { value: "detailing", label: "Детейлинг и мойка" },
  { value: "master", label: "Частный мастер" },
  { value: "electric", label: "Автоэлектрик" },
];

export default function RegisterBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    serviceName: "",
    serviceType: "sto",
    address: "",
    district: "",
    description: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.password) {
      setError("Заполните все обязательные поля");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.serviceName || !form.address) {
      setError("Название и адрес обязательны");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при регистрации");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Аккаунт создан, но не удалось войти. Попробуйте вручную.");
      } else {
        router.push("/business");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Ошибка сети. Попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-prussian flex items-center justify-center group-hover:shadow-brand transition-shadow">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-prussian">
            Auto<span className="text-gradient-brand">Eco</span>
            <span className="text-sm font-normal text-text-muted ml-2">Business</span>
          </span>
        </Link>

        <div className="card-surface">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-brand text-white" : "bg-prussian/[0.06] text-text-dim"}`}>1</div>
            <div className={`w-8 h-0.5 ${step >= 2 ? "bg-brand" : "bg-prussian/[0.1]"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-brand text-white" : "bg-prussian/[0.06] text-text-dim"}`}>2</div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-text">
              {step === 1 ? "Аккаунт владельца" : "Данные сервиса"}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {step === 1 ? "Шаг 1 — ваши данные" : "Шаг 2 — информация о сервисе"}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Ваше имя *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="input-field text-sm !pl-10" placeholder="Имя Фамилия" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="input-field text-sm !pl-10" placeholder="business@email.com" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пароль *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateField("password", e.target.value)} className="input-field text-sm !pl-10 !pr-10" placeholder="Минимум 6 символов" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Подтвердите пароль *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} className="input-field text-sm !pl-10" placeholder="Повторите пароль" required minLength={6} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Телефон</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="input-field text-sm !pl-10" placeholder="+7..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Город</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)} className="input-field text-sm !pl-10" placeholder="Москва" />
                  </div>
                </div>
              </div>
              <button type="button" onClick={handleNext} className="btn-primary w-full justify-center text-sm !py-3">
                <span className="flex items-center gap-2">Далее <ArrowRight className="w-4 h-4" /></span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Название сервиса *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type="text" value={form.serviceName} onChange={(e) => updateField("serviceName", e.target.value)} className="input-field text-sm !pl-10" placeholder="АвтоТех Премиум" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Тип сервиса *</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <select value={form.serviceType} onChange={(e) => updateField("serviceType", e.target.value)} className="input-field text-sm !pl-10 appearance-none">
                    {serviceTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Адрес *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} className="input-field text-sm !pl-10" placeholder="ул. Примерная, 1" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Район</label>
                <input type="text" value={form.district} onChange={(e) => updateField("district", e.target.value)} className="input-field text-sm" placeholder="Центральный" />
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Описание</label>
                <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className="input-field text-sm min-h-[80px] resize-none" placeholder="Расскажите о вашем сервисе..." />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center text-sm !py-3">
                  Назад
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Создаём...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Создать <ArrowRight className="w-4 h-4" /></span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="text-brand-light hover:text-brand font-medium transition-colors">Войти</Link>
            </p>
            <p className="text-xs text-text-dim mt-2">
              <Link href="/auth/register" className="hover:text-text-muted transition-colors">Регистрация как автовладелец</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
