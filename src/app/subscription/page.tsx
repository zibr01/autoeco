"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/Toast";
import {
  Crown,
  Check,
  X,
  Shield,
  Car,
  Loader2,
  Sparkles,
  TrendingUp,
  Calculator,
  MapPin,
  Wrench,
  Droplets,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

// ── ROI Calculator ────────────────────────────────────────────────────────────

function ROICalculator() {
  const [visits, setVisits] = useState(6);
  const [avgBill, setAvgBill] = useState(3000);

  const annualSpend = visits * avgBill;
  const savings = Math.round(annualSpend * 0.25);
  const subCost = 11988; // 999 * 12
  const netBenefit = savings - subCost;
  const isPositive = netBenefit > 0;

  return (
    <div className="card-surface max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h2 className="font-bold text-text text-lg">Калькулятор окупаемости</h2>
          <p className="text-text-muted text-sm">Посчитайте вашу личную выгоду</p>
        </div>
      </div>

      {/* Visits slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text">
            Сколько раз в год вы посещаете сервис?
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisits((v) => Math.max(1, v - 1))}
              className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-text-muted hover:border-brand/40 hover:text-brand transition-colors font-bold text-lg leading-none"
            >
              −
            </button>
            <span className="w-10 text-center font-bold text-text text-lg">{visits}</span>
            <button
              onClick={() => setVisits((v) => Math.min(24, v + 1))}
              className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-text-muted hover:border-brand/40 hover:text-brand transition-colors font-bold text-lg leading-none"
            >
              +
            </button>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          value={visits}
          onChange={(e) => setVisits(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #5932E6 0%, #5932E6 ${((visits - 1) / 23) * 100}%, var(--progress-bg) ${((visits - 1) / 23) * 100}%, var(--progress-bg) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-text-dim mt-1">
          <span>1 раз</span>
          <span>24 раза</span>
        </div>
      </div>

      {/* Average bill slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text">
            Средний чек за одно ТО
          </label>
          <span className="font-bold text-text text-lg">{avgBill.toLocaleString("ru")} ₽</span>
        </div>
        <input
          type="range"
          min={1000}
          max={10000}
          step={500}
          value={avgBill}
          onChange={(e) => setAvgBill(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #5932E6 0%, #5932E6 ${((avgBill - 1000) / 9000) * 100}%, var(--progress-bg) ${((avgBill - 1000) / 9000) * 100}%, var(--progress-bg) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-text-dim mt-1">
          <span>1 000 ₽</span>
          <span>10 000 ₽</span>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl bg-[var(--bg-elevated)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Ваши траты на сервис в год</span>
          <span className="font-semibold text-text">{annualSpend.toLocaleString("ru")} ₽</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Ваша экономия в год (25%)</span>
          <span className="font-semibold text-emerald-500">+{savings.toLocaleString("ru")} ₽</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Стоимость клубной карты в год</span>
          <span className="font-semibold text-text">−{subCost.toLocaleString("ru")} ₽</span>
        </div>
        <div className="border-t border-[var(--divider)] pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-text">Чистая выгода</span>
          <span
            className={`text-xl font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {netBenefit.toLocaleString("ru")} ₽
          </span>
        </div>
        {isPositive && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-center">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Карта окупается за {Math.ceil(subCost / (savings / 12))} мес. — экономите уже в первый год
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--divider)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-text">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-text-dim flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-dim flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-4 text-sm text-text-muted leading-relaxed">{a}</div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const partnerTypes = [
  { icon: Wrench, label: "СТО", discount: "20–30%" },
  { icon: Droplets, label: "Автомойка", discount: "15–25%" },
  { icon: Sparkles, label: "Детейлинг", discount: "20–25%" },
  { icon: Package, label: "Запчасти", discount: "10–20%" },
  { icon: Car, label: "Шиномонтаж", discount: "15–20%" },
];

const howItWorks = [
  {
    step: "1",
    title: "Оформляете клубную карту",
    desc: "999 ₽ в месяц или 9 990 ₽ в год — активируется мгновенно",
  },
  {
    step: "2",
    title: "Записываетесь через AutoEco",
    desc: "Выбираете партнёрский сервис с меткой «Клубные цены»",
  },
  {
    step: "3",
    title: "Получаете скидку автоматически",
    desc: "Система применяет клубную цену и показывает, сколько вы сэкономили",
  },
];

export default function SubscriptionPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [annual, setAnnual] = useState(false);

  // Subscription request flow
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPhone, setRequestPhone] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          setCurrentPlan(data.subscription?.toLowerCase() || "free");
        })
        .finally(() => setLoading(false));
    }
  }, [authStatus, router]);

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;
    if (planId === "premium") {
      setShowRequestModal(true);
      return;
    }
    setUpgrading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: planId.toUpperCase() }),
      });
      if (res.ok) setCurrentPlan(planId);
    } catch {
      toast("Не удалось изменить план подписки", "error");
    } finally {
      setUpgrading(false);
    }
  };

  const handleSubscriptionRequest = async () => {
    setRequestLoading(true);
    try {
      await fetch("/api/subscription/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: requestPhone }),
      });
      setRequestSuccess(true);
    } catch {
      toast("Не удалось отправить заявку. Попробуйте позже", "error");
    } finally {
      setRequestLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand-light animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const monthlyClub = 999;
  const annualClub = 9990;
  const annualMonthlyEquiv = Math.round(annualClub / 12); // 832

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-16 pb-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-medium mb-5">
            <Crown className="w-4 h-4" />
            Клубная карта AutoEco
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text tracking-tight mb-3 leading-tight">
            Клубная карта{" "}
            <span className="text-gradient-brand">AutoEco</span>
          </h1>
          <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
            Окупается за один визит на сервис
          </p>

          {/* Key stat */}
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div className="text-left">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                2 400 ₽ / мес
              </div>
              <div className="text-sm text-text-muted">средняя экономия участника клуба</div>
            </div>
          </div>
        </div>

        {/* ── ROI Calculator ───────────────────────────────────────────── */}
        <ROICalculator />

        {/* ── Annual toggle ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!annual ? "text-text font-medium" : "text-text-muted"}`}>
              Помесячно
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-brand" : "bg-[var(--progress-bg)]"}`}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                style={{ left: annual ? "26px" : "2px" }}
              />
            </button>
            <span className={`text-sm ${annual ? "text-text font-medium" : "text-text-muted"}`}>
              Платить ежегодно{" "}
              <span className="text-emerald-500 font-bold">— 2 месяца бесплатно</span>
            </span>
          </div>
          {annual && (
            <div className="text-xs text-text-muted">
              9 990 ₽ в год · всего {annualMonthlyEquiv} ₽/мес · экономия 1 998 ₽
            </div>
          )}
        </div>

        {/* ── Plan cards ───────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* FREE */}
          <div
            className={`relative rounded-2xl border overflow-hidden transition-all ${
              currentPlan === "free" ? "ring-2 ring-brand/40" : "border-[var(--border)]"
            }`}
          >
            <div className="p-6 bg-gradient-to-br from-gray-500 to-gray-400 text-white">
              <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">
                Бесплатно
              </div>
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <p className="text-sm opacity-75 mb-4">Для знакомства с платформой</p>
              <div className="text-4xl font-extrabold">0 ₽</div>
              <div className="text-sm opacity-70 mt-1">навсегда</div>
            </div>

            <div className="p-6 bg-[var(--bg-card)]">
              <ul className="space-y-3 mb-6">
                {[
                  { text: "2 авто в гараже", ok: true },
                  { text: "Базовые напоминания о ТО", ok: true },
                  { text: "5 AI-диагностик в месяц", ok: true },
                  { text: "Базовая история ТО", ok: true },
                  { text: "Стандартные цены в сервисах", ok: true },
                  { text: "Клубные цены у партнёров", ok: false },
                  { text: "Приоритетная запись", ok: false },
                  { text: "x2 EcoPoints", ok: false },
                  { text: "Аналитика расходов", ok: false },
                  { text: "24/7 поддержка", ok: false },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    {f.ok ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-text-dim flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${f.ok ? "text-text" : "text-text-dim line-through"}`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {currentPlan === "free" ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-medium bg-brand/10 text-brand border border-brand/20">
                  Текущий план
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade("free")}
                  disabled={upgrading}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all border border-[var(--border)] text-text-muted hover:text-text hover:border-[var(--border-medium)] disabled:opacity-50"
                >
                  Перейти на Free
                </button>
              )}
            </div>
          </div>

          {/* CLUB */}
          <div
            className={`relative rounded-2xl border border-brand/40 overflow-hidden shadow-lg shadow-brand/10 transition-all ${
              currentPlan === "premium" ? "ring-2 ring-brand" : ""
            }`}
          >
            {/* Recommended badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-brand to-accent text-white text-xs font-bold px-4 py-1 rounded-bl-xl z-10">
              Рекомендуем
            </div>

            <div className="p-6 bg-gradient-to-br from-brand to-brand-light text-white">
              <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">
                Клубная карта
              </div>
              <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Club
              </h3>
              <p className="text-sm opacity-75 mb-4">Клубные цены у всех партнёров</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">
                  {annual ? `${annualMonthlyEquiv} ₽` : `${monthlyClub} ₽`}
                </span>
                <span className="text-sm opacity-75">/ мес</span>
              </div>
              {annual ? (
                <div className="mt-2 text-sm opacity-80">
                  {annualClub.toLocaleString("ru")} ₽ в год · экономия 1 998 ₽
                </div>
              ) : (
                <div className="mt-2 text-sm opacity-80">
                  или {annualClub.toLocaleString("ru")} ₽/год — 2 мес. бесплатно
                </div>
              )}
            </div>

            <div className="p-6 bg-[var(--bg-card)]">
              <ul className="space-y-3 mb-6">
                {[
                  { text: "До 5 авто в гараже", highlight: false },
                  { text: "Неограниченные напоминания и история", highlight: false },
                  { text: "Неограниченная AI-диагностика", highlight: false },
                  { text: "КЛУБНЫЕ ЦЕНЫ у партнёров (−15–30%)", highlight: true },
                  { text: "КЛУБНЫЕ ЦЕНЫ на запчасти (−10–20%)", highlight: true },
                  { text: "Приоритетная запись", highlight: false },
                  { text: "x2 EcoPoints", highlight: false },
                  { text: "Аналитика расходов", highlight: false },
                  { text: "24/7 поддержка", highlight: false },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.highlight ? "text-accent" : "text-emerald-500"}`}
                    />
                    <span
                      className={`text-sm ${f.highlight ? "font-semibold text-text" : "text-text"}`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {currentPlan === "premium" ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-medium bg-brand/10 text-brand border border-brand/20">
                  Текущий план
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade("premium")}
                  disabled={upgrading}
                  className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
                >
                  {upgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Оформить клубную карту
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-text text-center mb-8">
            Как это работает
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="card-surface text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-extrabold text-brand">{step.step}</span>
                </div>
                <h3 className="font-semibold text-text mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Partners showcase ────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-text text-center mb-2">
            Партнёры принимают клубную карту
          </h2>
          <p className="text-text-muted text-center text-sm mb-8 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" />
            Растущая сеть в Самаре
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {partnerTypes.map((p) => (
              <div
                key={p.label}
                className="card-surface flex flex-col items-center text-center gap-3 py-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <p.icon className="w-6 h-6 text-brand" />
                </div>
                <div className="font-semibold text-text text-sm">{p.label}</div>
                <span className="tag tag-green text-xs">−{p.discount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div className="card-surface max-w-2xl mx-auto">
          <h3 className="font-bold text-text text-lg mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-light" />
            Частые вопросы
          </h3>
          <div>
            {[
              {
                q: "Как применяется скидка?",
                a: "Автоматически при бронировании через AutoEco. Система распознаёт вашу клубную карту и показывает клубную цену ещё на этапе выбора сервиса. Ничего дополнительно предъявлять не нужно.",
              },
              {
                q: "Могу ли я отменить подписку?",
                a: "Да, в любой момент без штрафов. Оплаченный период продолжит действовать до конца. После отмены вы вернётесь на тариф Free со всеми сохранёнными данными.",
              },
              {
                q: "Сколько сервисов принимают карту?",
                a: "Растущая сеть партнёров в Самаре: СТО, мойки, детейлинг-студии, магазины запчастей и шиномонтажи. Список регулярно пополняется — все партнёры помечены значком «Клубные цены» в каталоге.",
              },
              {
                q: "Можно ли добавить несколько авто?",
                a: "Да, клубная карта действует сразу на все ваши авто — до 5 машин. Семейный автопарк управляется из одного аккаунта.",
              },
            ].map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Subscription request modal ──────────────────────────────── */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowRequestModal(false); setRequestSuccess(false); setRequestPhone(""); } }}
        >
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-sm p-6">
            {requestSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Заявка отправлена!</h3>
                <p className="text-sm text-text-muted mb-6">
                  Мы свяжемся с вами в течение 24 часов.
                </p>
                <button
                  onClick={() => { setShowRequestModal(false); setRequestSuccess(false); setRequestPhone(""); }}
                  className="btn-primary w-full justify-center py-2.5 text-sm"
                >
                  Отлично
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-text flex items-center gap-2">
                    <Crown className="w-5 h-5 text-brand" />
                    Оформить клубную карту
                  </h3>
                  <button
                    onClick={() => { setShowRequestModal(false); setRequestPhone(""); }}
                    className="text-text-dim hover:text-text transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-text-muted mb-5">
                  Оставьте заявку и мы активируем клубную карту в течение 24 часов.
                </p>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-text mb-2">
                    Телефон <span className="text-text-dim">(необязательно)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+7 (900) 000-00-00"
                    value={requestPhone}
                    onChange={(e) => setRequestPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
                  />
                </div>
                <button
                  onClick={handleSubscriptionRequest}
                  disabled={requestLoading}
                  className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
                >
                  {requestLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Отправить заявку
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </AppLayout>
  );
}
