"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  User,
  Car,
  Calendar,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  ChevronRight,
  Loader2,
  Star,
  X,
  Send,
} from "lucide-react";

type Tab = "profile" | "cars" | "bookings" | "settings";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  subscription: string;
  _count: { cars: number; bookings: number; reviews: number };
}

interface CarItem {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  health: number;
  image: string;
}

interface BookingItem {
  id: string;
  serviceCenterId: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  serviceCenter: { name: string; address: string };
  car: { make: string; model: string; licensePlate: string };
}

const statusLabel: Record<string, { text: string; class: string }> = {
  confirmed: { text: "Подтверждено", class: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending: { text: "Ожидает", class: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  completed: { text: "Завершено", class: "text-text-muted bg-prussian/[0.03] border-prussian/[0.08]" },
  cancelled: { text: "Отменено", class: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      Promise.all([
        fetch("/api/profile").then((r) => r.json()),
        fetch("/api/cars").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
      ])
        .then(([profileData, carsData, bookingsData]) => {
          setProfile(profileData);
          setCars(carsData);
          setBookings(bookingsData);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authStatus, router]);

  if (loading || authStatus === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Профиль", icon: <User className="w-4 h-4" /> },
    { key: "cars", label: "Мои авто", icon: <Car className="w-4 h-4" /> },
    { key: "bookings", label: "Записи", icon: <Calendar className="w-4 h-4" /> },
    { key: "settings", label: "Настройки", icon: <Settings className="w-4 h-4" /> },
  ];

  const userName = profile?.name || session?.user?.name || "Пользователь";
  const userCity = profile?.city || "Москва";
  const isPremium = profile?.subscription === "PREMIUM";

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Личный кабинет</h1>
        <p className="text-text-muted text-sm mt-1">Управляйте профилем, автомобилями и записями</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-surface mb-4">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center mb-3">
                <User className="w-10 h-10 text-brand-light" />
              </div>
              <h2 className="font-semibold text-text text-lg">{userName}</h2>
              <p className="text-text-muted text-sm">{userCity}</p>
              {isPremium && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20">
                  <Shield className="w-3.5 h-3.5 text-brand-light" />
                  <span className="text-xs font-medium text-brand-light">Premium</span>
                </div>
              )}
            </div>

            <div className="flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    tab === t.key
                      ? "bg-brand/20 text-text border border-brand/30 font-medium"
                      : "text-text-muted hover:text-text hover:bg-prussian/[0.03]"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === "profile" && <ProfileTab profile={profile} cars={cars} />}
          {tab === "cars" && <CarsTab cars={cars} />}
          {tab === "bookings" && <BookingsTab bookings={bookings} />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </AppLayout>
  );
}

function ProfileTab({ profile, cars }: { profile: Profile | null; cars: CarItem[] }) {
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.city || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="card-surface">
        <h3 className="font-semibold text-text mb-5">Личные данные</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Имя</label>
            <input className="input-field text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Телефон</label>
            <input className="input-field text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Email</label>
            <input className="input-field text-sm opacity-60" value={profile?.email || ""} disabled />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Город</label>
            <input className="input-field text-sm" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary mt-6 text-sm">
          {saving ? "Сохранение..." : saved ? "Сохранено!" : "Сохранить изменения"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface text-center">
          <div className="text-3xl font-bold text-brand-light mb-1">{cars.length}</div>
          <div className="text-text-muted text-sm">Автомобилей</div>
        </div>
        <div className="card-surface text-center">
          <div className="text-3xl font-bold text-accent mb-1">{profile?._count?.bookings || 0}</div>
          <div className="text-text-muted text-sm">Записей</div>
        </div>
        <div className="card-surface text-center">
          <div className="text-3xl font-bold text-emerald-400 mb-1">{profile?._count?.reviews || 0}</div>
          <div className="text-text-muted text-sm">Отзывов</div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card-surface border-brand/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-brand-light" />
              <h3 className="font-semibold text-text">
                Подписка {profile?.subscription === "PREMIUM" ? "Premium" : "Free"}
              </h3>
            </div>
            <p className="text-text-muted text-sm mb-3">
              {profile?.subscription === "PREMIUM"
                ? "До 5 авто, безлимит AI-диагностики, расширенная история, приоритетная поддержка"
                : "До 2 авто, базовая диагностика, история ТО"}
            </p>
          </div>
          <span className="tag text-xs text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            {profile?.subscription === "PREMIUM" ? "Активна" : "Бесплатно"}
          </span>
        </div>
      </div>
    </div>
  );
}

function CarsTab({ cars }: { cars: CarItem[] }) {
  return (
    <div className="space-y-4">
      {cars.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Car className="w-10 h-10 mx-auto mb-3 text-text-dim" />
          <p>У вас пока нет автомобилей</p>
        </div>
      )}
      {cars.map((car) => (
        <Link key={car.id} href={`/garage/${car.id}`} className="card-surface flex items-center gap-5 group hover:border-brand/30 transition-all">
          <div className="w-24 h-16 rounded-xl overflow-hidden bg-bg-elevated flex-shrink-0">
            <img src={car.image} alt={car.make} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text text-sm">{car.make} {car.model}</h3>
              <span className="text-xs text-text-muted">{car.year}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span>{car.licensePlate}</span>
              <span>{car.mileage.toLocaleString("ru")} км</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${car.health >= 80 ? "bg-emerald-400" : car.health >= 60 ? "bg-amber-400" : "bg-red-400"}`} />
                {car.health}%
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-dim group-hover:text-brand-light transition-colors flex-shrink-0" />
        </Link>
      ))}

      <Link
        href="/garage"
        className="card-surface flex items-center justify-center gap-2 py-6 border-dashed border-prussian/[0.08] hover:border-brand/30 hover:bg-brand/5 transition-all text-text-muted hover:text-brand-light"
      >
        <span className="text-2xl">+</span>
        <span className="text-sm font-medium">Добавить автомобиль</span>
      </Link>
    </div>
  );
}

function BookingsTab({ bookings: initialBookings }: { bookings: BookingItem[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Вы уверены, что хотите отменить запись?")) return;
    setCancelling(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "cancelled" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, status: updated.status } : b)));
      }
    } catch {}
    setCancelling(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking || !reviewText.trim()) return;
    setReviewSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCenterId: reviewBooking.serviceCenterId,
          rating: reviewRating,
          text: reviewText,
          carModel: `${reviewBooking.car.make} ${reviewBooking.car.model}`,
        }),
      });
      if (res.ok) {
        setReviewedIds((prev) => new Set(prev).add(reviewBooking.id));
        setReviewBooking(null);
        setReviewText("");
        setReviewRating(5);
      }
    } catch {}
    setReviewSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-semibold text-text">Мои записи</h3>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-text-dim" />
          <p>У вас пока нет записей</p>
          <Link href="/services" className="btn-primary mt-4 inline-flex text-sm">
            Найти сервис
          </Link>
        </div>
      )}

      {bookings.map((b) => {
        const st = statusLabel[b.status] || statusLabel.pending;
        const d = new Date(b.date);
        const canCancel = b.status === "pending" || b.status === "confirmed";
        const canReview = b.status === "completed" && !reviewedIds.has(b.id);
        return (
          <div key={b.id} className="card-surface">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <h4 className="font-medium text-text text-sm">{b.serviceType}</h4>
                <p className="text-text-muted text-xs mt-0.5">{b.serviceCenter.name} · {b.serviceCenter.address}</p>
              </div>
              <span className={`tag text-xs border ${st.class}`}>{st.text}</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {d.toLocaleDateString("ru", { day: "numeric", month: "long" })} в {b.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  {b.car.make} {b.car.model}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canReview && (
                  <button
                    onClick={() => {
                      setReviewBooking(b);
                      setReviewRating(5);
                      setReviewText("");
                    }}
                    className="text-xs text-brand-light hover:text-brand hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Оставить отзыв
                  </button>
                )}
                {reviewedIds.has(b.id) && (
                  <span className="text-xs text-emerald-400 px-3 py-1.5 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-emerald-400" />
                    Отзыв отправлен
                  </span>
                )}
                {canCancel && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {cancelling === b.id ? "Отмена..." : "Отменить"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReviewBooking(null)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-text">Оставить отзыв</h2>
              <button onClick={() => setReviewBooking(null)} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-sm text-text-muted">
                <span className="text-text font-medium">{reviewBooking.serviceCenter.name}</span>
                <br />
                {reviewBooking.serviceType} · {reviewBooking.car.make} {reviewBooking.car.model}
              </div>

              {/* Star rating */}
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Оценка</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= reviewRating
                            ? "text-accent fill-accent"
                            : "text-text-dim"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review text */}
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Ваш отзыв</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="input-field text-sm min-h-[100px] resize-none"
                  placeholder="Расскажите о качестве работы, отношении персонала, соответствии цены..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={reviewSending || !reviewText.trim()}
                className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewSending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправка...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Отправить отзыв
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState({
    reminderTO: true,
    reminderDocs: true,
    promoServices: false,
    emailNewsletter: false,
    showProfile: true,
    geolocation: true,
  });
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSaveSettings = () => {
    // Store settings in localStorage
    localStorage.setItem("autoeco_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("autoeco_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch {}
    setDeleting(false);
  };

  const notifItems = [
    { key: "reminderTO" as const, label: "Напоминания о ТО", desc: "Уведомления по пробегу и срокам" },
    { key: "reminderDocs" as const, label: "Истечение документов", desc: "ОСАГО, техосмотр, регистрация" },
    { key: "promoServices" as const, label: "Акции сервисов", desc: "Скидки и спецпредложения от партнёров" },
    { key: "emailNewsletter" as const, label: "Email-рассылка", desc: "Полезные статьи и новости платформы" },
  ];

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="card-surface">
        <h3 className="font-semibold text-text mb-5">Уведомления</h3>
        <div className="space-y-4">
          {notifItems.map((item) => (
            <label key={item.key} className="flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <div className="text-sm text-text font-medium">{item.label}</div>
                <div className="text-xs text-text-muted">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={() => toggle(item.key)}
                className="mt-1 w-5 h-5 rounded bg-bg-elevated border-prussian/[0.08] text-brand accent-brand cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="card-surface">
        <h3 className="font-semibold text-text mb-5">Конфиденциальность</h3>
        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm text-text font-medium">Показывать профиль</div>
              <div className="text-xs text-text-muted">Другие пользователи могут видеть ваши отзывы</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showProfile}
              onChange={() => toggle("showProfile")}
              className="mt-1 w-5 h-5 rounded bg-bg-elevated border-prussian/[0.08] text-brand accent-brand cursor-pointer"
            />
          </label>
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm text-text font-medium">Геолокация</div>
              <div className="text-xs text-text-muted">Определять ближайшие сервисы автоматически</div>
            </div>
            <input
              type="checkbox"
              checked={settings.geolocation}
              onChange={() => toggle("geolocation")}
              className="mt-1 w-5 h-5 rounded bg-bg-elevated border-prussian/[0.08] text-brand accent-brand cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSaveSettings} className="btn-primary text-sm">
        {saved ? "Сохранено!" : "Сохранить настройки"}
      </button>

      {/* Danger zone */}
      <div className="card-surface border-red-500/10">
        <h3 className="font-semibold text-red-400 mb-3">Опасная зона</h3>
        <p className="text-text-muted text-sm mb-4">
          Удаление аккаунта приведёт к потере всех данных, включая историю ТО и записи. Это действие необратимо.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
          >
            Удалить аккаунт
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {deleting ? "Удаление..." : "Да, удалить навсегда"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text hover:bg-[var(--hover-bg)] transition-all"
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
