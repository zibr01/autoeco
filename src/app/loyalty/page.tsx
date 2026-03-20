"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  Award,
  Star,
  TrendingUp,
  Gift,
  Car,
  MessageSquare,
  CalendarCheck,
  LogIn,
  Users,
  Wrench,
  ChevronRight,
  Loader2,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Gem,
  Trophy,
  MapPin,
  Building2,
  Lock,
  Check,
} from "lucide-react";

/* ── Types ──────────────────────────────────────── */

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface LoyaltyData {
  balance: number;
  level: { name: string; label: string; min: number; discount: number };
  nextLevel: { name: string; label: string; min: number; discount: number } | null;
  pointsToNext: number;
  progress: number;
  transactions: Transaction[];
  rules: Record<string, number>;
  levels: { name: string; label: string; min: number; discount: number }[];
}

/* ── Level system (25 levels) ───────────────────── */

interface GameLevel {
  level: number;
  name: string;
  tier: string;
  pointsRequired: number;
  cashback: number;
  reward: string;
  isMilestone: boolean;
}

const LEVELS: GameLevel[] = [
  // Tier 1: Новичок (1-5)
  { level: 1, name: "Новичок I", tier: "newcomer", pointsRequired: 0, cashback: 1, reward: "Приветственный бонус 50 баллов", isMilestone: false },
  { level: 2, name: "Новичок II", tier: "newcomer", pointsRequired: 100, cashback: 1.2, reward: "Скидка 3% на первый сервис", isMilestone: false },
  { level: 3, name: "Новичок III", tier: "newcomer", pointsRequired: 250, cashback: 1.5, reward: "+25 бонусных баллов", isMilestone: false },
  { level: 4, name: "Новичок IV", tier: "newcomer", pointsRequired: 500, cashback: 1.7, reward: "Промокод партнёра на мойку", isMilestone: false },
  { level: 5, name: "Новичок V", tier: "newcomer", pointsRequired: 800, cashback: 2, reward: "Программа «Быстрый старт»: x2 баллы на неделю", isMilestone: true },

  // Tier 2: Водитель (6-10)
  { level: 6, name: "Водитель I", tier: "driver", pointsRequired: 1200, cashback: 2.5, reward: "Скидка 5% у партнёров", isMilestone: false },
  { level: 7, name: "Водитель II", tier: "driver", pointsRequired: 1700, cashback: 2.8, reward: "+50 бонусных баллов", isMilestone: false },
  { level: 8, name: "Водитель III", tier: "driver", pointsRequired: 2300, cashback: 3, reward: "Бесплатная диагностика", isMilestone: false },
  { level: 9, name: "Водитель IV", tier: "driver", pointsRequired: 3000, cashback: 3.5, reward: "Premium-подписка 1 день", isMilestone: false },
  { level: 10, name: "Водитель V", tier: "driver", pointsRequired: 4000, cashback: 4, reward: "Программа «Дорожный клуб»: эксклюзивные скидки партнёров", isMilestone: true },

  // Tier 3: Эксперт (11-15)
  { level: 11, name: "Эксперт I", tier: "expert", pointsRequired: 5000, cashback: 4.5, reward: "Premium 1 день/неделю", isMilestone: false },
  { level: 12, name: "Эксперт II", tier: "expert", pointsRequired: 6500, cashback: 5, reward: "Скидка 10% на ТО", isMilestone: false },
  { level: 13, name: "Эксперт III", tier: "expert", pointsRequired: 8000, cashback: 5.5, reward: "+100 бонусных баллов", isMilestone: false },
  { level: 14, name: "Эксперт IV", tier: "expert", pointsRequired: 10000, cashback: 6, reward: "Premium-подписка 3 дня", isMilestone: false },
  { level: 15, name: "Эксперт V", tier: "expert", pointsRequired: 12500, cashback: 7, reward: "Программа «Эксперт-консультант»: приоритетная поддержка", isMilestone: true },

  // Tier 4: Мастер (16-20)
  { level: 16, name: "Мастер I", tier: "master", pointsRequired: 15000, cashback: 7.5, reward: "Premium-подписка 1 неделя", isMilestone: false },
  { level: 17, name: "Мастер II", tier: "master", pointsRequired: 18000, cashback: 8, reward: "Эксклюзивные предложения партнёров", isMilestone: false },
  { level: 18, name: "Мастер III", tier: "master", pointsRequired: 22000, cashback: 8.5, reward: "+200 бонусных баллов", isMilestone: false },
  { level: 19, name: "Мастер IV", tier: "master", pointsRequired: 27000, cashback: 9, reward: "Premium-подписка 2 недели", isMilestone: false },
  { level: 20, name: "Мастер V", tier: "master", pointsRequired: 33000, cashback: 10, reward: "Программа «Мастер-класс»: Premium на месяц + VIP-скидки", isMilestone: true },

  // Tier 5: Легенда (21-25)
  { level: 21, name: "Легенда I", tier: "legend", pointsRequired: 40000, cashback: 11, reward: "Premium навсегда + скидка 15%", isMilestone: false },
  { level: 22, name: "Легенда II", tier: "legend", pointsRequired: 50000, cashback: 12, reward: "VIP-поддержка 24/7", isMilestone: false },
  { level: 23, name: "Легенда III", tier: "legend", pointsRequired: 65000, cashback: 13, reward: "+500 бонусных баллов", isMilestone: false },
  { level: 24, name: "Легенда IV", tier: "legend", pointsRequired: 80000, cashback: 14, reward: "Максимальные скидки у всех партнёров", isMilestone: false },
  { level: 25, name: "Легенда V", tier: "legend", pointsRequired: 100000, cashback: 15, reward: "Программа «Легенда»: все привилегии + персональный менеджер", isMilestone: true },
];

const tierMeta: Record<string, { label: string; gradient: string; glassGradient: string; icon: typeof Star; accentColor: string; borderColor: string }> = {
  newcomer: {
    label: "Новичок",
    gradient: "from-emerald-400 to-teal-500",
    glassGradient: "from-emerald-500/20 via-teal-500/10 to-emerald-400/5",
    icon: Star,
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  driver: {
    label: "Водитель",
    gradient: "from-blue-400 to-indigo-500",
    glassGradient: "from-blue-500/20 via-indigo-500/10 to-blue-400/5",
    icon: Car,
    accentColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  expert: {
    label: "Эксперт",
    gradient: "from-violet-400 to-purple-600",
    glassGradient: "from-violet-500/20 via-purple-500/10 to-violet-400/5",
    icon: Shield,
    accentColor: "text-violet-400",
    borderColor: "border-violet-500/30",
  },
  master: {
    label: "Мастер",
    gradient: "from-amber-400 to-orange-500",
    glassGradient: "from-amber-500/20 via-orange-500/10 to-amber-400/5",
    icon: Gem,
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30",
  },
  legend: {
    label: "Легенда",
    gradient: "from-rose-400 via-pink-500 to-purple-600",
    glassGradient: "from-rose-500/20 via-pink-500/15 to-purple-500/10",
    icon: Crown,
    accentColor: "text-rose-400",
    borderColor: "border-rose-500/30",
  },
};

/* ── Mock social rankings ───────────────────────── */

interface RankEntry {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  points: number;
  isCurrentUser?: boolean;
}

const friendsRanking: RankEntry[] = [
  { rank: 1, name: "Алексей М.", avatar: "АМ", level: 14, points: 10250 },
  { rank: 2, name: "Мария К.", avatar: "МК", level: 12, points: 7800 },
  { rank: 3, name: "Дмитрий С.", avatar: "ДС", level: 11, points: 5400 },
  { rank: 4, name: "Кирилл", avatar: "КИ", level: 8, points: 2450, isCurrentUser: true },
  { rank: 5, name: "Ольга В.", avatar: "ОВ", level: 6, points: 1500 },
  { rank: 6, name: "Иван Р.", avatar: "ИР", level: 5, points: 900 },
  { rank: 7, name: "Анна Л.", avatar: "АЛ", level: 3, points: 300 },
];

const districtRanking: RankEntry[] = [
  { rank: 1, name: "Виктор Т.", avatar: "ВТ", level: 19, points: 28000 },
  { rank: 2, name: "Елена Ш.", avatar: "ЕШ", level: 17, points: 19500 },
  { rank: 3, name: "Сергей П.", avatar: "СП", level: 15, points: 13000 },
  { rank: 4, name: "Наталья Б.", avatar: "НБ", level: 13, points: 8500 },
  { rank: 5, name: "Андрей Г.", avatar: "АГ", level: 11, points: 5200 },
  { rank: 6, name: "Кирилл", avatar: "КИ", level: 8, points: 2450, isCurrentUser: true },
  { rank: 7, name: "Татьяна Н.", avatar: "ТН", level: 7, points: 1800 },
  { rank: 8, name: "Роман Ф.", avatar: "РФ", level: 4, points: 550 },
];

const cityRanking: RankEntry[] = [
  { rank: 1, name: "Максим Д.", avatar: "МД", level: 25, points: 105000 },
  { rank: 2, name: "Ирина К.", avatar: "ИК", level: 23, points: 72000 },
  { rank: 3, name: "Павел А.", avatar: "ПА", level: 22, points: 55000 },
  { rank: 4, name: "Светлана Р.", avatar: "СР", level: 20, points: 35000 },
  { rank: 5, name: "Николай З.", avatar: "НЗ", level: 18, points: 22000 },
  { rank: 12, name: "Кирилл", avatar: "КИ", level: 8, points: 2450, isCurrentUser: true },
];

const rankingsData: Record<string, { data: RankEntry[]; label: string }> = {
  friends: { data: friendsRanking, label: "Друзья" },
  district: { data: districtRanking, label: "Район" },
  city: { data: cityRanking, label: "Самара" },
};

/* ── Helpers ─────────────────────────────────────── */

const typeIcons: Record<string, typeof Star> = {
  booking: CalendarCheck,
  review: MessageSquare,
  car_added: Car,
  maintenance: Wrench,
  daily_login: LogIn,
  referral: Users,
  promo: Gift,
  spent: Zap,
};

const typeLabels: Record<string, string> = {
  booking: "Бронирование",
  review: "Отзыв",
  car_added: "Добавление авто",
  maintenance: "Запись ТО",
  daily_login: "Ежедневный вход",
  referral: "Приглашение друга",
  promo: "Промоакция",
  spent: "Списание",
};

function getCurrentGameLevel(points: number): number {
  let current = 1;
  for (const lvl of LEVELS) {
    if (points >= lvl.pointsRequired) current = lvl.level;
    else break;
  }
  return current;
}

function getProgressToNext(points: number, currentLevel: number): number {
  const current = LEVELS[currentLevel - 1];
  const next = LEVELS[currentLevel]; // next level (0-indexed)
  if (!next) return 100;
  const range = next.pointsRequired - current.pointsRequired;
  const progress = points - current.pointsRequired;
  return Math.min(Math.round((progress / range) * 100), 100);
}

/* ── Rank tab icons ─────────────────────────────── */

const tabIcons: Record<string, typeof Star> = {
  friends: Users,
  district: MapPin,
  city: Building2,
};

/* ── Component ──────────────────────────────────── */

export default function LoyaltyPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rankTab, setRankTab] = useState<string>("friends");
  const currentLevelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetch("/api/loyalty")
        .then((r) => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [authStatus, router]);

  // Scroll current level into view in the timeline
  useEffect(() => {
    if (currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [data]);

  if (authStatus === "loading" || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand-light animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return null;

  const userPoints = data.balance;
  const currentLevel = getCurrentGameLevel(userPoints);
  const currentLevelData = LEVELS[currentLevel - 1];
  const nextLevelData = LEVELS[currentLevel] || null;
  const progressPercent = getProgressToNext(userPoints, currentLevel);
  const tier = tierMeta[currentLevelData.tier];
  const TierIcon = tier.icon;

  const currentRanking = rankingsData[rankTab];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">EcoPoints</h1>
            <p className="text-text-muted">Программа лояльности AutoEco</p>
          </div>
        </div>

        {/* ── Glass Level Card ─────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl p-[1px] mb-8">
          {/* Animated gradient border */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${tier.gradient} opacity-40`} />

          {/* Glass inner */}
          <div className="relative rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)" }}>
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.glassGradient}`} />
            <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "var(--card-bg)" }} />

            {/* Decorative elements */}
            <div className="absolute top-[-40px] right-[-40px] w-56 h-56 opacity-[0.07]">
              <Crown className="w-full h-full" />
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r ${tier.gradient} opacity-30`} />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Left side */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                      <TierIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Уровень {currentLevel}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-text mb-1">{currentLevelData.name}</h2>
                  <p className="text-sm text-text-muted mb-4">{tier.label} &mdash; кэшбэк {currentLevelData.cashback}%</p>

                  <div className="flex items-end gap-6">
                    <div>
                      <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Баланс</div>
                      <div className="text-4xl sm:text-5xl font-extrabold text-text leading-none">
                        {userPoints.toLocaleString("ru")}
                      </div>
                      <div className="text-sm text-text-muted mt-1">баллов</div>
                    </div>
                    <div className={`rounded-2xl border ${tier.borderColor} px-4 py-3`} style={{ background: "var(--ghost-bg)" }}>
                      <div className="text-xs text-text-dim mb-0.5">Кэшбэк</div>
                      <div className={`text-2xl font-bold ${tier.accentColor}`}>{currentLevelData.cashback}%</div>
                    </div>
                  </div>
                </div>

                {/* Right side: circular level badge */}
                <div className="hidden sm:flex flex-col items-center">
                  <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${tier.gradient} p-[3px]`}>
                    <div className="w-full h-full rounded-full flex flex-col items-center justify-center" style={{ background: "var(--bg-card)" }}>
                      <span className="text-3xl font-extrabold text-text">{currentLevel}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">уровень</span>
                    </div>
                    {/* Progress ring (SVG) */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="53" fill="none" strokeWidth="3" className="stroke-current text-text-dim/10" />
                      <circle
                        cx="56" cy="56" r="53" fill="none" strokeWidth="3"
                        className={`stroke-current ${tier.accentColor}`}
                        strokeDasharray={`${2 * Math.PI * 53}`}
                        strokeDashoffset={`${2 * Math.PI * 53 * (1 - progressPercent / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-text-dim mt-2">{progressPercent}% до следующего</span>
                </div>
              </div>

              {/* Progress bar */}
              {nextLevelData && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-muted">
                      До уровня {nextLevelData.level} &laquo;{nextLevelData.name}&raquo;
                    </span>
                    <span className="font-semibold text-text">
                      {(nextLevelData.pointsRequired - userPoints).toLocaleString("ru")} баллов
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--progress-bg)" }}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} transition-all duration-1000`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main grid ────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left column: How to earn + Transactions */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Как заработать
            </h3>

            {Object.entries(data.rules).map(([type, points]) => {
              const Icon = typeIcons[type] || Star;
              return (
                <div key={type} className="card-surface flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text">{typeLabels[type] || type}</div>
                  </div>
                  <span className="text-sm font-bold text-brand">+{points}</span>
                </div>
              );
            })}

            {/* Referral CTA */}
            <div className="card-surface bg-gradient-to-r from-brand/5 to-accent/5 border-brand/20 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-light" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text">Пригласите друга</div>
                  <div className="text-sm text-text-muted">
                    Получите <span className="text-brand font-bold">100 баллов</span> за каждого
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-dim flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Right column: History + Rankings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction history */}
            <div>
              <h3 className="font-semibold text-text flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-emerald-500" />
                История начислений
              </h3>

              {data.transactions.length === 0 ? (
                <div className="card-surface text-center py-12">
                  <Award className="w-12 h-12 text-text-dim mx-auto mb-3" />
                  <p className="text-text-muted mb-1">Пока нет начислений</p>
                  <p className="text-text-dim text-sm">
                    Бронируйте сервисы, оставляйте отзывы и добавляйте авто, чтобы зарабатывать EcoPoints
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.transactions.map((tx) => {
                    const Icon = typeIcons[tx.type] || Star;
                    const isPositive = tx.amount > 0;
                    return (
                      <div key={tx.id} className="card-surface flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                        }`}>
                          <Icon className={`w-4 h-4 ${isPositive ? "text-emerald-500" : "text-red-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text truncate">{tx.description}</div>
                          <div className="text-xs text-text-dim">
                            {new Date(tx.createdAt).toLocaleDateString("ru", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${isPositive ? "text-emerald-500" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}{tx.amount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Social Rankings ───────────────────── */}
            <div>
              <h3 className="font-semibold text-text flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                Рейтинг
              </h3>

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "var(--bg-elevated)" }}>
                {Object.entries(rankingsData).map(([key, { label }]) => {
                  const TabIcon = tabIcons[key];
                  const active = rankTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setRankTab(key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-brand text-white shadow-brand"
                          : "text-text-muted hover:text-text hover:bg-[var(--hover-bg)]"
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Ranking list */}
              <div className="space-y-2">
                {currentRanking.data.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  const isUser = entry.isCurrentUser;
                  const entryLevelData = LEVELS[entry.level - 1];
                  const entryTier = tierMeta[entryLevelData.tier];

                  const medalColors: Record<number, string> = {
                    1: "from-amber-400 to-yellow-500",
                    2: "from-gray-300 to-gray-400",
                    3: "from-amber-600 to-amber-700",
                  };

                  return (
                    <div
                      key={entry.rank + entry.name}
                      className={`relative flex items-center gap-3 rounded-2xl p-3 transition-all ${
                        isUser
                          ? "border-2 border-brand/30 shadow-brand/10 shadow-lg"
                          : "border border-[var(--border)]"
                      }`}
                      style={{ background: isUser ? "var(--tag-brand-bg)" : "var(--bg-card)" }}
                    >
                      {/* Rank */}
                      <div className="w-8 flex-shrink-0 text-center">
                        {isTop3 ? (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${medalColors[entry.rank]} flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">{entry.rank}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-text-dim">{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${entryTier.gradient} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{entry.avatar}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate ${isUser ? "text-brand" : "text-text"}`}>
                          {entry.name}
                          {isUser && <span className="text-xs ml-1 text-text-muted">(вы)</span>}
                        </div>
                        <div className="text-xs text-text-dim">
                          Ур. {entry.level} &middot; {entryTier.label}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-text">{entry.points.toLocaleString("ru")}</div>
                        <div className="text-[10px] text-text-dim">баллов</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Level Timeline ───────────────────────── */}
        <div className="mt-10 mb-4">
          <h3 className="font-semibold text-text flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-brand-light" />
            Все уровни
            <span className="text-sm font-normal text-text-dim ml-1">({LEVELS.length} уровней)</span>
          </h3>

          <div className="relative max-h-[600px] overflow-y-auto scrollbar-hide rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--bg-surface)" }}>
            {/* Timeline line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-[2px]" style={{ background: "var(--progress-bg)" }} />

            <div className="space-y-1">
              {LEVELS.map((lvl) => {
                const lvlTier = tierMeta[lvl.tier];
                const isCurrentLvl = lvl.level === currentLevel;
                const isUnlocked = userPoints >= lvl.pointsRequired;
                const isLocked = !isUnlocked;

                return (
                  <div
                    key={lvl.level}
                    ref={isCurrentLvl ? currentLevelRef : undefined}
                    className={`relative flex items-start gap-4 py-3 px-2 rounded-xl transition-all ${
                      isCurrentLvl
                        ? "ring-2 ring-brand/30 shadow-lg"
                        : ""
                    }`}
                    style={isCurrentLvl ? { background: "var(--tag-brand-bg)" } : {}}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      {lvl.isMilestone ? (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${lvlTier.gradient} flex items-center justify-center ${
                          isLocked ? "opacity-40" : "shadow-lg"
                        }`}>
                          {isUnlocked ? (
                            <Trophy className="w-5 h-5 text-white" />
                          ) : (
                            <Lock className="w-4 h-4 text-white/70" />
                          )}
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                          isUnlocked
                            ? `${lvlTier.borderColor} bg-gradient-to-br ${lvlTier.glassGradient}`
                            : "border-[var(--border)] bg-[var(--bg-elevated)]"
                        } ${isLocked ? "opacity-50" : ""}`}>
                          {isUnlocked ? (
                            <Check className={`w-4 h-4 ${lvlTier.accentColor}`} />
                          ) : (
                            <span className="text-xs font-bold text-text-dim">{lvl.level}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 ${isLocked ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${isCurrentLvl ? "text-brand" : "text-text"}`}>
                          {lvl.name}
                        </span>
                        {lvl.isMilestone && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${lvlTier.gradient} text-white`}>
                            <Sparkles className="w-3 h-3" />
                            Программа
                          </span>
                        )}
                        {isCurrentLvl && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand text-white">
                            Вы здесь
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-dim mt-0.5">
                        {lvl.pointsRequired.toLocaleString("ru")} баллов &middot; кэшбэк {lvl.cashback}%
                      </div>
                      <div className={`text-xs mt-1 ${lvl.isMilestone ? "font-semibold text-text" : "text-text-muted"}`}>
                        {lvl.reward}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
