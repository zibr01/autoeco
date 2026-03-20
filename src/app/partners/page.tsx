import Link from "next/link";
import {
  Car,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Crown,
  MapPin,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    title: "Бесплатное размещение в каталоге",
    desc: "Ваш сервис появляется в поиске AutoEco с фото, описанием, рейтингом и онлайн-записью. Никаких скрытых платежей.",
    color: "text-brand",
    bg: "bg-brand/10",
  },
  {
    icon: Crown,
    title: "Клиенты с клубной картой записываются активнее",
    desc: "Владельцы Premium-подписки видят сервисы с клубной скидкой в приоритете. Больше записей — больше выручки.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Аналитика заявок и рейтинг",
    desc: "Личный кабинет с детальной статистикой: записи по месяцам, топ клиентов, распределение по часам и дням.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const steps = [
  {
    num: "01",
    title: "Регистрируетесь",
    desc: "Создайте бизнес-аккаунт и заполните профиль сервиса: фото, услуги, адрес и режим работы.",
  },
  {
    num: "02",
    title: "Выставляете клубную скидку",
    desc: "Укажите скидку для владельцев карты AutoEco Club — от 5 до 50%. Рекомендуем 10–20%.",
  },
  {
    num: "03",
    title: "Получаете клиентов",
    desc: "Клубники видят ваш сервис с маркером скидки. Онлайн-записи приходят прямо в кабинет.",
  },
];

export default function PartnersPage() {
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
          <div className="flex items-center gap-3">
            <Link href="/profile" className="hidden sm:block text-sm text-text-muted hover:text-prussian transition-colors">
              Войти
            </Link>
            <Link
              href="/auth/register-business"
              className="text-sm font-semibold px-5 py-2 rounded-lg bg-brand text-white transition-all hover:shadow-brand hover:-translate-y-0.5"
            >
              Зарегистрировать сервис
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(89,50,230,0.06) 0%, transparent 60%)"
        }} />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-1/4 left-[15%] w-72 h-72 rounded-full bg-brand/[0.04] blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-[15%] w-56 h-56 rounded-full bg-amber-400/[0.03] blur-[80px] animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-prussian/[0.08] bg-white/60 mb-10 animate-fade-up">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-text-muted">Партнёрская программа AutoEco</span>
          </div>

          <h1
            className="animate-fade-up"
            style={{
              fontSize: "clamp(2rem, 7vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: "1.5rem",
            }}
          >
            <span className="text-prussian">Станьте партнёром</span>
            <br />
            <span className="text-gradient-brand">AutoEco</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-4 leading-relaxed animate-fade-up-delay">
            Бесплатное размещение. Клиенты из клуба. Аналитика.
          </p>
          <p className="text-sm text-text-dim max-w-xl mx-auto mb-12 animate-fade-up-delay">
            Подключите ваш автосервис к платформе и получайте верифицированные записи от автомобилистов Самары.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
            <Link href="/auth/register-business" className="btn-primary text-base px-8 py-4">
              Зарегистрировать сервис
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services" className="btn-ghost text-base px-8 py-4">
              Смотреть каталог
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { v: "45 млн", l: "автомобилистов в России" },
              { v: "Самара", l: "первый город запуска" },
              { v: "Бесплатно", l: "размещение в каталоге" },
              { v: "AutoEco Club", l: "лояльные клиенты с картой" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-gradient-brand mb-2 tracking-tight">{s.v}</div>
                <div className="text-text-dim text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line max-w-md mx-auto" />

      {/* ═══ Benefits ═══ */}
      <section className="py-28 max-w-7xl mx-auto px-5">
        <div className="text-center mb-16">
          <div className="tag-brand mb-4 inline-flex">Преимущества</div>
          <h2 className="section-title mb-4">Почему AutoEco?</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Три причины, по которым сервисы выбирают нашу платформу
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="card-surface h-full flex flex-col hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${b.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="text-base font-bold text-prussian mb-3">{b.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-1">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Как это работает</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Три шага от регистрации до первых клиентов
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="card-surface h-full relative overflow-hidden group">
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
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line max-w-md mx-auto" />

      {/* ═══ Club Program Highlight ═══ */}
      <section className="py-28 max-w-7xl mx-auto px-5">
        <div
          className="rounded-3xl p-8 sm:p-12 md:p-16 border relative overflow-hidden"
          style={{
            borderColor: "rgba(89,50,230,0.12)",
            background: "linear-gradient(160deg, rgba(89,50,230,0.04) 0%, #FFFFFF 60%)",
          }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/[0.04] rounded-full blur-[100px] pointer-events-none" />

          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-600 text-xs font-semibold mb-6">
                <Crown className="w-3.5 h-3.5" /> AutoEco Club
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1.25rem" }}>
                Клубники — ваши<br />
                <span className="text-gradient-brand">лучшие клиенты</span>
              </h2>
              <p className="text-text-muted leading-relaxed mb-8">
                Владельцы Premium-подписки AutoEco Club получают приоритетный доступ к сервисам с клубной скидкой. Они записываются чаще, оставляют больше отзывов и рекомендуют сервис друзьям.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Клубники видят ваш сервис с маркером скидки",
                  "Фильтр «Клубная скидка» в каталоге",
                  "Аналитика клубных заявок в кабинете",
                  "Вы устанавливаете размер скидки сами (0–50%)",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-text-muted text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register-business" className="btn-primary">
                Подключиться бесплатно <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Новых клиентов/мес", value: "+40%", c: "text-brand" },
                { icon: TrendingUp, label: "Рост выручки", value: "+25%", c: "text-emerald-500" },
                { icon: Crown, label: "Средний рейтинг клубников", value: "4.9", c: "text-amber-500" },
                { icon: BarChart3, label: "Аналитика", value: "Real-time", c: "text-prussian" },
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
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(89,50,230,0.04) 0%, transparent 60%)"
        }} />
        <div className="relative max-w-2xl mx-auto px-5">
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-8 shadow-brand">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Готовы начать?
          </h2>
          <p className="text-text-muted text-lg mb-10">
            Регистрация занимает 5 минут. Размещение бесплатное.
          </p>
          <Link href="/auth/register-business" className="btn-primary text-base px-10 py-4">
            Зарегистрировать сервис <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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
