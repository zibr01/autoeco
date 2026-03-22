"use client";

import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getPlatform } from "@/lib/platform";
import {
  Car,
  Bell,
  MapPin,
  Package,
  ArrowRight,
  Star,
  Shield,
  ChevronRight,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bot,
  Sparkles,
  Heart,
  Scale,
  Ticket,
  MessageSquare,
  BarChart3,
  UserCheck,
  CalendarCheck,
} from "lucide-react";

/* ── Business Landing ─────────────────────────── */

const businessFeatures = [
  { icon: CalendarCheck, title: "Онлайн-записи", desc: "Клиенты записываются сами — без звонков и ожидания" },
  { icon: UserCheck, title: "Управление клиентами", desc: "База клиентов, история визитов и предпочтения" },
  { icon: BarChart3, title: "Аналитика", desc: "Выручка, загрузка, конверсия — все метрики в одном месте" },
  { icon: Star, title: "Отзывы и репутация", desc: "Верифицированные отзывы и управление рейтингом" },
];

function BusinessLanding() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-prussian flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-prussian">
              Auto<span className="text-gradient-brand">Eco</span>
            </span>
            <span className="text-xs font-medium text-text-dim ml-1">Business</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-text-muted hover:text-prussian transition-colors">
              Войти
            </Link>
            <Link href="/auth/register-business" className="text-sm font-semibold px-5 py-2 rounded-lg bg-brand text-white transition-all hover:shadow-brand hover:-translate-y-0.5">
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center pt-16">
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-prussian/[0.08] bg-white/60 mb-8 animate-fade-up">
            <span className="text-sm text-text-muted">Платформа для автосервисов</span>
          </div>

          <h1 className="animate-fade-up mb-6" style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            <span className="text-prussian">AutoEco </span>
            <span className="text-gradient-brand">Business</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-muted max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up">
            Управляйте автосервисом эффективно
          </p>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-fade-up">
            {businessFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-surface text-left">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-prussian mb-1">{f.title}</h3>
                  <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mb-12 animate-fade-up">
            {[
              { v: "8", l: "сервисов" },
              { v: "50+", l: "записей" },
              { v: "4.7", l: "средний рейтинг" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-extrabold text-gradient-brand tracking-tight">{s.v}</div>
                <div className="text-text-dim text-xs">{s.l}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
            <Link href="/auth/login" className="btn-primary px-8 py-3">
              Войти <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/register-business" className="btn-ghost px-8 py-3">
              Зарегистрировать сервис
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-prussian/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
          <span className="font-bold text-sm text-prussian">AutoEco Business</span>
          <span className="text-text-dim text-xs">&copy; 2026 AutoEco</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Admin Landing ────────────────────────────── */

function AdminLanding() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="card-surface max-w-md w-full mx-5 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-prussian flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          <span className="text-prussian">AutoEco </span>
          <span className="text-gradient-brand">Admin</span>
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Панель управления экосистемой
        </p>
        <Link href="/auth/login" className="btn-primary px-8 py-3 inline-flex">
          Войти <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

/* ── Data ──────────────────────────────────────── */

const features = [
  {
    icon: Car,
    title: "Цифровой гараж",
    desc: "Цифровой паспорт каждого автомобиля. История ТО, документы, пробег — всё в одном месте.",
    gradient: "from-brand to-brand-dark",
    href: "/garage",
  },
  {
    icon: Bell,
    title: "Умные напоминания",
    desc: "Напоминания по пробегу и дате: масло, резина, страховка. Никогда не пропустишь ТО.",
    gradient: "from-accent to-accent-dark",
    href: "/garage",
  },
  {
    icon: MapPin,
    title: "Каталог сервисов",
    desc: "Проверенные СТО, мойки, шиномонтаж. Рейтинги, отзывы и онлайн-запись за 2 минуты.",
    gradient: "from-prussian to-prussian-dark",
    href: "/services",
  },
  {
    icon: Bot,
    title: "AI-диагностика",
    desc: "Опиши симптом — получи объяснение и уровень срочности. Больше не нужно ехать вслепую.",
    gradient: "from-brand-light to-brand",
    href: "/diagnostics",
  },
  {
    icon: Package,
    title: "Подбор запчастей",
    desc: "Поиск по VIN. Оригинал и аналоги с агрегацией цен от Exist, Autodoc и других.",
    gradient: "from-emerald-500 to-emerald-600",
    href: "/parts",
  },
];

const problems = [
  { before: "Бумажная книжка или заметки", after: "Цифровой журнал ТО с историей" },
  { before: "2GIS и сарафанное радио", after: "Каталог с рейтингами и онлайн-записью" },
  { before: "Едешь в сервис вслепую", after: "AI объясняет симптом и срочность" },
  { before: "5+ вкладок для поиска запчастей", after: "Агрегатор с подбором по VIN" },
  { before: "Разрозненные чеки и квитанции", after: "История привязана к автомобилю" },
];

const steps = [
  { num: "01", title: "Добавь автомобиль", desc: "Введи VIN — мы автоматически заполним все данные. Займёт 30 секунд." },
  { num: "02", title: "Получай напоминания", desc: "Платформа следит за пробегом и датами. Уведомление за 2 недели до ТО." },
  { num: "03", title: "Записывайся онлайн", desc: "Выбери сервис рядом. Запись в 2 клика — без звонков и ожидания." },
];

/* ── Page ──────────────────────────────────────── */

export default function LandingPage() {
  const platform = getPlatform();
  if (platform === "business") return <BusinessLanding />;
  if (platform === "admin") return <AdminLanding />;

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">

      {/* ═══ Header ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-prussian flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-prussian">
              Auto<span className="text-gradient-brand">Eco</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {["Гараж", "Сервисы", "Диагностика", "Запчасти"].map((label, i) => {
              const hrefs = ["/garage", "/services", "/diagnostics", "/parts"];
              return (
                <Link
                  key={label}
                  href={hrefs[i]}
                  className="px-3.5 py-2 rounded-lg text-sm text-text-muted hover:text-prussian hover:bg-prussian/[0.04] transition-all"
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/profile" className="hidden sm:block text-sm text-text-muted hover:text-prussian transition-colors">
              Войти
            </Link>
            <Link
              href="/garage"
              className="text-sm font-semibold px-5 py-2 rounded-lg bg-brand text-white transition-all hover:shadow-brand hover:-translate-y-0.5"
            >
              Попробовать
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(89,50,230,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 75% 60%, rgba(89,50,230,0.03) 0%, transparent 50%)"
        }} />
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-[15%] w-72 h-72 rounded-full bg-brand/[0.04] blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-[15%] w-56 h-56 rounded-full bg-brand/[0.03] blur-[80px] animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-prussian/[0.08] bg-white/60 mb-10 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-sm text-text-muted">Умная экосистема для автомобилистов</span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up"
            style={{
              fontSize: "clamp(2rem, 8vw, 6.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginBottom: "2rem",
            }}
          >
            <span className="text-prussian">Твой автомобиль.</span>
            <br />
            <span className="text-gradient-brand">Вся информация.</span>
            <br />
            <span className="text-prussian">Одно место.</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up-delay">
            Цифровой гараж, умные напоминания, каталог сервисов с онлайн-записью,
            AI-диагностика и подбор запчастей — всё связано вместе.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-up-delay-2">
            <Link href="/garage" className="btn-primary text-base px-8 py-4">
              Открыть гараж
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services" className="btn-ghost text-base px-8 py-4">
              Найти сервис
              <MapPin className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 text-text-dim text-xs sm:text-sm flex-wrap animate-fade-up-delay-2">
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> Проверенные сервисы</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-accent" /> Реальные отзывы</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand" /> Запись за 2 минуты</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-dim text-xs animate-pulse-slow">
          <span>Листай</span>
          <div className="w-5 h-8 rounded-full border border-prussian/10 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-prussian/20 animate-float" />
          </div>
        </div>
      </section>

      {/* ═══ Dashboard Preview ═══ */}
      <section className="relative py-4 -mt-16">
        <Reveal scale>
          <div className="max-w-5xl mx-auto px-5">
            <div className="absolute inset-x-0 top-0 h-40 mx-20 bg-gradient-to-b from-brand/[0.04] to-transparent blur-2xl pointer-events-none" />

            <div
              className="relative rounded-2xl border border-prussian/[0.08] overflow-hidden"
              style={{ background: "#FFFFFF", boxShadow: "0 32px 80px rgba(13,35,52,0.08), 0 0 0 1px rgba(13,35,52,0.04)" }}
            >
              {/* Browser bar */}
              <div className="px-5 py-3 flex items-center gap-3 border-b border-prussian/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-7 rounded-lg bg-bg-elevated border border-prussian/[0.06] flex items-center px-3">
                    <span className="text-xs text-text-dim">autoeco.ru/garage</span>
                  </div>
                </div>
              </div>

              {/* Dashboard grid */}
              <div className="p-3 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-2 rounded-xl p-4 border border-prussian/[0.06] bg-bg-elevated">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-prussian">BMW 5 Series 530i</div>
                      <div className="text-xs text-text-dim">87 400 км · 2021 г.</div>
                    </div>
                    <div className="ml-auto tag-green">82%</div>
                  </div>
                  <div className="h-1.5 rounded-full bg-prussian/[0.06] overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-brand to-brand-light" />
                  </div>
                </div>
                <div className="rounded-xl p-4 border border-accent/20 bg-accent/[0.04]">
                  <Bell className="w-5 h-5 text-accent mb-2" />
                  <div className="text-xs font-semibold text-prussian mb-1">Замена масла</div>
                  <div className="text-xs text-text-dim">через 2 600 км</div>
                </div>
                <div className="rounded-xl p-4 border border-prussian/[0.06] bg-bg-elevated">
                  <div className="text-[10px] text-text-dim mb-1 uppercase tracking-wider">Последнее ТО</div>
                  <div className="text-sm font-semibold text-prussian">15 нояб. 2024</div>
                </div>
                <div className="rounded-xl p-4 border border-brand/10 bg-brand/[0.03]">
                  <div className="text-[10px] text-text-dim mb-1 uppercase tracking-wider">Следующее ТО</div>
                  <div className="text-sm font-semibold text-brand">90 000 км</div>
                </div>
                <div className="rounded-xl p-4 border border-emerald-500/10 bg-emerald-500/[0.03]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                  <div className="text-xs font-semibold text-prussian">ОСАГО</div>
                  <div className="text-[10px] text-text-dim">до 01.06.2025</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="py-24">
        <Reveal>
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {[
                { v: "45 млн", l: "автомобилей в России" },
                { v: "90 000+", l: "сервисов на карте" },
                { v: "8 трлн ₽", l: "рынок автосервисов" },
                { v: "1 место", l: "для всего об авто" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gradient-brand mb-2 tracking-tight">{s.v}</div>
                  <div className="text-text-dim text-sm">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <div className="glow-line max-w-md mx-auto" />

      {/* ═══ Problem vs Solution ═══ */}
      <section className="py-28 max-w-7xl mx-auto px-5">
        <Reveal>
          <div className="text-center mb-16">
            <div className="tag-brand mb-4 inline-flex">Проблема</div>
            <h2 className="section-title mb-4">Почему это нужно</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Автомобилист вынужден использовать 5–7 разных сервисов для обслуживания машины
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="card-surface space-y-4 h-full">
              <div className="text-sm font-medium text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Сейчас
              </div>
              {problems.map((p) => (
                <div key={p.before} className="flex items-start gap-3 py-1">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </div>
                  <span className="text-text-muted text-sm">{p.before}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="card-surface space-y-4 h-full" style={{ borderColor: "rgba(89,50,230,0.12)", background: "linear-gradient(135deg, rgba(89,50,230,0.03), rgba(89,50,230,0.01))" }}>
              <div className="text-sm font-medium text-brand uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> С AutoEco
              </div>
              {problems.map((p) => (
                <div key={p.after} className="flex items-start gap-3 py-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-prussian text-sm font-medium">{p.after}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">5 модулей. Одна платформа.</h2>
              <p className="section-subtitle max-w-xl mx-auto">
                Каждый модуль решает конкретную боль. Все связаны между собой.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 100}>
                  <Link
                    href={f.href}
                    className="group card-surface block hover:-translate-y-2 hover:shadow-card-hover transition-all duration-500"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-prussian mb-2">{f.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex items-center gap-1 text-brand text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                      Открыть <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="glow-line max-w-md mx-auto" />

      {/* ═══ How it works ═══ */}
      <section className="py-28 max-w-7xl mx-auto px-5">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Как это работает</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Три простых шага до первого обслуживания через AutoEco
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 120}>
              <div className="card-surface h-full relative overflow-hidden group">
                <span className="absolute -top-4 -right-2 text-[7rem] font-black text-prussian/[0.03] leading-none select-none group-hover:text-prussian/[0.06] transition-colors duration-500">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/10 flex items-center justify-center mb-5">
                    <span className="text-brand font-bold text-sm">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-prussian mb-2">{step.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ B2B ═══ */}
      <section className="py-28">
        <Reveal>
          <div className="max-w-7xl mx-auto px-5">
            <div
              className="rounded-3xl p-5 sm:p-10 md:p-16 border border-prussian/[0.06] relative overflow-hidden"
              style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F3F3FB 100%)" }}
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand/[0.03] rounded-full blur-[100px] pointer-events-none" />

              <div className="relative grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="tag-brand mb-5 inline-flex">Для бизнеса</div>
                  <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1.25rem" }}>
                    Привлекай клиентов<br />
                    <span className="text-gradient-brand">через AutoEco</span>
                  </h2>
                  <p className="text-text-muted leading-relaxed mb-8">
                    Размести свой сервис, управляй расписанием и получай верифицированные отзывы.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Профиль с фото, прайсом и галереей работ", "Онлайн-расписание и управление записями", "Аналитика и статистика", "Верифицированные отзывы"].map((t) => (
                      <li key={t} className="flex items-start gap-3 text-text-muted text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {t}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register-business" className="btn-primary">
                    Подключить сервис <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: "Новых клиентов/мес", value: "+40%", c: "text-brand" },
                    { icon: TrendingUp, label: "Рост выручки", value: "+25%", c: "text-emerald-500" },
                    { icon: Star, label: "Средний рейтинг", value: "4.8", c: "text-accent" },
                    { icon: Clock, label: "Время на админ.", value: "−60%", c: "text-prussian" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl p-5 border border-prussian/[0.06] bg-white">
                      <m.icon className={`w-5 h-5 ${m.c} mb-3`} />
                      <div className="text-2xl font-extrabold text-prussian mb-1 tracking-tight">{m.value}</div>
                      <div className="text-xs text-text-dim">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ New Features ═══ */}
      <section className="py-28 max-w-7xl mx-auto px-5">
        <Reveal>
          <div className="text-center mb-16">
            <div className="tag-brand mb-4 inline-flex">Новое</div>
            <h2 className="section-title mb-4">Ещё больше возможностей</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Мы постоянно развиваем платформу. Вот что появилось недавно.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Heart, title: "Избранное", desc: "Сохраняй любимые сервисы для быстрого доступа", color: "text-red-400", bg: "bg-red-500/10" },
            { icon: Scale, title: "Сравнение", desc: "Сравнивай до 3 сервисов бок о бок по всем параметрам", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: Ticket, title: "Промокоды", desc: "Получай скидки от сервисов при записи через платформу", color: "text-sky-400", bg: "bg-sky-500/10" },
            { icon: MessageSquare, title: "Ответы на отзывы", desc: "Сервисы отвечают на отзывы — живой диалог", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="card-surface text-center h-full">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mx-auto mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-prussian mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="glow-line max-w-md mx-auto" />

      {/* ═══ Testimonials ═══ */}
      <section className="py-28">
        <Reveal>
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">Что говорят пользователи</h2>
              <p className="section-subtitle max-w-xl mx-auto">
                Отзывы реальных автомобилистов и владельцев сервисов
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  name: "Алексей К.",
                  role: "BMW 5 Series",
                  text: "Наконец-то всё в одном месте. Раньше я вёл заметки в телефоне и терял чеки. Теперь вся история привязана к машине, напоминания приходят сами.",
                  rating: 5,
                },
                {
                  name: "Марина Д.",
                  role: "Владелица СТО «АвтоМастер»",
                  text: "За первый месяц получили +30% новых клиентов. Онлайн-запись экономит 2 часа в день на телефонных звонках. Промокоды отлично работают.",
                  rating: 5,
                },
                {
                  name: "Дмитрий В.",
                  role: "Toyota Camry",
                  text: "AI-диагностика удивила. Описал стук при торможении — система точно определила износ колодок. Сразу записался в ближайший сервис.",
                  rating: 5,
                },
              ].map((t, i) => (
                <Reveal key={t.name} delay={i * 100}>
                  <div className="card-surface h-full flex flex-col">
                    <div className="flex items-center gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-prussian/[0.06]">
                      <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-brand">{t.name[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-prussian">{t.name}</div>
                        <div className="text-xs text-text-dim">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(89,50,230,0.04) 0%, transparent 60%)"
        }} />
        <Reveal>
          <div className="relative max-w-2xl mx-auto px-5">
            <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-8 shadow-brand">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
              Начни прямо сейчас
            </h2>
            <p className="text-text-muted text-lg mb-10">
              Добавь свой автомобиль — займёт меньше минуты
            </p>
            <Link href="/garage" className="btn-primary text-base px-10 py-4">
              Открыть мой гараж <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-prussian/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-prussian flex items-center justify-center">
              <Car className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-prussian">AutoEco</span>
            <span className="text-text-dim text-xs ml-1">— умная экосистема</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-text-dim flex-wrap justify-center">
            <Link href="/garage" className="hover:text-prussian transition-colors">Гараж</Link>
            <Link href="/services" className="hover:text-prussian transition-colors">Сервисы</Link>
            <Link href="/compare" className="hover:text-prussian transition-colors">Сравнение</Link>
            <Link href="/diagnostics" className="hover:text-prussian transition-colors">Диагностика</Link>
            <Link href="/parts" className="hover:text-prussian transition-colors">Запчасти</Link>
            <Link href="/partners" className="hover:text-prussian transition-colors font-medium text-brand">Партнёрам</Link>
            <Link href="/auth/register-business" className="hover:text-prussian transition-colors">Для бизнеса</Link>
          </div>
          <div className="text-text-dim text-xs">© 2026 AutoEco</div>
        </div>
      </footer>
    </div>
  );
}
