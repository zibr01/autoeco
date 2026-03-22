"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, AlertCircle, Check, Gift } from "lucide-react";
import { getPlatform, platformHome } from "@/lib/platform";

export default function RegisterPage() {
  const router = useRouter();
  const platform = getPlatform();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  useEffect(() => {
    if (platform !== "client") {
      router.replace("/");
    }
  }, [platform, router]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
  });
  const [referralCode, setReferralCode] = useState(refCode || "");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Pick up referral code from localStorage (set by /invite/[code])
    if (!referralCode) {
      const stored = localStorage.getItem("referralCode");
      if (stored) {
        setReferralCode(stored);
      }
    }
    // Clean up after use
    return () => {
      if (referralCode) {
        localStorage.removeItem("referralCode");
      }
    };
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          city: form.city || undefined,
          referralCode: referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при регистрации");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Аккаунт создан, но не удалось войти. Попробуйте вручную.");
      } else {
        router.push(platformHome[platform]);
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Ошибка сети. Попробуйте позже.");
    }
  };

  const passwordStrength = form.password.length >= 8 ? "strong" : form.password.length >= 6 ? "medium" : "weak";

  if (platform !== "client") return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-prussian flex items-center justify-center group-hover:shadow-brand transition-shadow">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-prussian">
            Auto<span className="text-gradient-brand">Eco</span>
          </span>
        </Link>

        {/* Card */}
        <div className="card-surface">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-text">Создать аккаунт</h1>
            <p className="text-text-muted text-sm mt-1">
              Присоединяйтесь к AutoEco
            </p>
          </div>

          {referralCode && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-brand/5 border border-brand/15 mb-5">
              <Gift className="w-4 h-4 text-brand-light flex-shrink-0" />
              <span className="text-sm text-brand-light">
                Вы получите <strong>300 EcoPoints</strong> за регистрацию по приглашению
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                Имя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input-field text-sm !pl-10"
                  placeholder="Ваше имя"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input-field text-sm !pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="input-field text-sm !pl-10 !pr-10"
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-prussian/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        passwordStrength === "strong"
                          ? "w-full bg-emerald-400"
                          : passwordStrength === "medium"
                          ? "w-2/3 bg-amber-400"
                          : "w-1/3 bg-red-400"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] ${
                    passwordStrength === "strong"
                      ? "text-emerald-400"
                      : passwordStrength === "medium"
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}>
                    {passwordStrength === "strong" ? "Надёжный" : passwordStrength === "medium" ? "Средний" : "Слабый"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="input-field text-sm !pl-10"
                  placeholder="Повторите пароль"
                  required
                  minLength={6}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                  Телефон
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="input-field text-sm !pl-10"
                    placeholder="+7..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                  Город
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="input-field text-sm !pl-10"
                    placeholder="Москва"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Создаём аккаунт...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Создать аккаунт
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="text-brand-light hover:text-brand font-medium transition-colors">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
