"use client";

import Link from "next/link";
import { Car, CalendarCheck, Users, BarChart3, Star, ArrowRight, Shield } from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Онлайн-записи",
    desc: "Принимайте записи клиентов 24/7 через удобную платформу",
  },
  {
    icon: Users,
    title: "Управление клиентами",
    desc: "Ведите базу клиентов, историю обслуживания и контакты",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    desc: "Отслеживайте ключевые метрики и рост вашего бизнеса",
  },
  {
    icon: Star,
    title: "Отзывы и репутация",
    desc: "Управляйте отзывами и повышайте рейтинг сервиса",
  },
];

const stats = [
  { value: "8 сервисов", label: "уже подключено" },
  { value: "50+ записей", label: "через платформу" },
  { value: "4.7 рейтинг", label: "средняя оценка" },
];

export default function B2BLandingPage() {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-prussian flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-prussian">
              Auto<span className="text-gradient-brand">Eco</span>
              <span className="text-sm font-normal text-text-muted ml-2">Business</span>
            </span>
          </div>
          <Link
            href="/b2b/login"
            className="text-sm font-medium text-brand-light hover:text-brand transition-colors"
          >
            Войти
          </Link>
        </header>

        {/* Hero */}
        <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto text-center animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-4">
            Управляйте автосервисом{" "}
            <span className="text-gradient-brand">эффективно</span>
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-10">
            AutoEco Business помогает автосервисам привлекать клиентов, управлять записями
            и развивать бизнес на единой платформе.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/b2b/login" className="btn-primary text-sm !py-3 !px-6">
              <span className="flex items-center gap-2">
                Войти
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              href="/auth/register-business"
              className="glass text-sm font-semibold py-3 px-6 rounded-xl text-text hover:bg-white/10 transition-colors"
            >
              Зарегистрировать сервис
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card-surface text-center animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-brand-light" />
                </div>
                <h3 className="font-bold text-text mb-1">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.value}>
                  <div className="text-2xl md:text-3xl font-extrabold text-gradient-brand">
                    {s.value}
                  </div>
                  <div className="text-text-muted text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 max-w-4xl mx-auto text-center animate-fade-up">
          <div className="card-surface !p-10">
            <Shield className="w-10 h-10 text-brand-light mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-2">
              Готовы начать?
            </h2>
            <p className="text-text-muted mb-6">
              Подключите ваш автосервис к AutoEco и начните принимать клиентов уже сегодня.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/b2b/login" className="btn-primary text-sm !py-3 !px-6">
                <span className="flex items-center gap-2">
                  Войти
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                href="/auth/register-business"
                className="glass text-sm font-semibold py-3 px-6 rounded-xl text-text hover:bg-white/10 transition-colors"
              >
                Зарегистрировать сервис
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center text-text-dim text-sm">
          &copy; 2026 AutoEco Business
        </footer>
      </div>
    </div>
  );
}
