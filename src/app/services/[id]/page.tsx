"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Phone,
  Shield,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Heart,
  Building2,
  Ticket,
  MessageSquare,
  X,
} from "lucide-react";

const serviceTypeColors: Record<string, string> = {
  sto: "bg-brand/10 text-brand border-brand/15",
  wash: "bg-sky-500/10 text-sky-600 border-sky-500/15",
  tires: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15",
  detailing: "bg-purple-500/10 text-purple-600 border-purple-500/15",
  master: "bg-accent/10 text-accent-dark border-accent/15",
  electric: "bg-yellow-500/10 text-yellow-600 border-yellow-500/15",
};

const dayLabels = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const monthLabels = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

interface ServiceData {
  id: string;
  ownerId: string | null;
  name: string;
  type: string;
  typeName: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  hours: string;
  image: string;
  description: string;
  services: string;
  photos: string;
  verified: boolean;
  priceList: { id: string; name: string; price: string }[];
  reviews: { id: string; author: string; avatar: string; rating: number; date: string; text: string; carModel: string; reply?: { text: string; createdAt: string } | null }[];
  timeSlots: { id: string; time: string; available: boolean }[];
}

interface CarItem {
  id: string;
  make: string;
  model: string;
  year: number;
}

export default function ServiceProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCarId, setSelectedCarId] = useState("");

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discountPercent?: number; description?: string; error?: string } | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const nextDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const [similarServices, setSimilarServices] = useState<{
    id: string; name: string; typeName: string; type: string; rating: number; reviewCount: number; image: string; address: string;
  }[]>([]);

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setService(data);
        const svcs = parseJson(data.services);
        if (svcs.length > 0) setSelectedService(svcs[0]);
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch similar services once service loads
  useEffect(() => {
    if (service) {
      fetch(`/api/services?type=${service.type}`)
        .then((r) => r.json())
        .then((data: { id: string; name: string; typeName: string; type: string; rating: number; reviewCount: number; image: string; address: string }[]) => {
          setSimilarServices(data.filter((s) => s.id !== id).slice(0, 3));
        })
        .catch(() => {});
    }
  }, [service, id]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/cars")
        .then((res) => res.json())
        .then((data) => {
          setCars(data);
          if (data.length > 0) setSelectedCarId(data[0].id);
        })
        .catch(() => {});
      fetch("/api/favorites")
        .then((r) => r.json())
        .then((favs: { serviceCenterId: string }[]) => {
          setIsFavorite(favs.some((f) => f.serviceCenterId === id));
        })
        .catch(() => {});
      if (session?.user?.name) {
        setName(session.user.name);
      }
    }
  }, [authStatus, session, id]);

  const toggleFavorite = async () => {
    if (authStatus !== "authenticated") { router.push("/auth/login"); return; }
    setFavLoading(true);
    try {
      if (isFavorite) {
        await fetch(`/api/favorites/${id}`, { method: "DELETE" });
        setIsFavorite(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceCenterId: id }),
        });
        setIsFavorite(true);
      }
    } catch {
      // silently fail
    } finally {
      setFavLoading(false);
    }
  };

  const checkPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoChecking(true);
    const res = await fetch("/api/promos/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode.trim(), serviceCenterId: id }),
    });
    const data = await res.json();
    setPromoResult(data);
    setPromoChecking(false);
  };

  const parseJson = (str: string): string[] => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits.startsWith("7") ? digits : "7" + digits;
    let formatted = "+7";
    if (d.length > 1) formatted += " (" + d.slice(1, 4);
    if (d.length > 4) formatted += ") " + d.slice(4, 7);
    if (d.length > 7) formatted += "-" + d.slice(7, 9);
    if (d.length > 9) formatted += "-" + d.slice(9, 11);
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      setPhone(digits.length > 0 ? formatPhone(value) : "");
      setPhoneError("");
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setNameError("");
  };

  const validateForm = () => {
    let valid = true;
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11) {
      setPhoneError("Введите полный номер телефона");
      valid = false;
    }
    if (name.trim().length < 2) {
      setNameError("Введите ваше имя");
      valid = false;
    }
    return valid;
  };

  const handleBook = async () => {
    if (!selectedTime) return;
    if (!validateForm()) return;

    if (authStatus !== "authenticated") {
      router.push("/auth/login");
      return;
    }

    if (!selectedCarId) {
      alert("Сначала добавьте автомобиль в гараж");
      router.push("/garage");
      return;
    }

    setBooking(true);
    try {
      const d = nextDays[selectedDay];
      const bookingDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCenterId: service!.id,
          carId: selectedCarId,
          serviceType: selectedService,
          date: bookingDate.toISOString(),
          time: selectedTime,
        }),
      });

      if (res.ok) {
        setBooked(true);
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка при записи");
      }
    } catch {
      alert("Ошибка сети");
    } finally {
      setBooking(false);
    }
  };

  const renderBookingForm = () => (
    <div className="card-surface">
      <h2 className="font-semibold text-text mb-5">Онлайн-запись</h2>

      {/* Car select */}
      <div className="mb-4">
        <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Автомобиль</label>
        {authStatus === "authenticated" && cars.length > 0 ? (
          <select
            className="input-field text-sm bg-white"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
          >
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model} {c.year}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-text-muted p-3 rounded-xl bg-bg-elevated">
            <Link href="/auth/login" className="text-brand-light hover:underline">Войдите</Link> чтобы выбрать авто
          </div>
        )}
      </div>

      {/* Service select */}
      <div className="mb-4">
        <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Услуга</label>
        <select
          className="input-field text-sm bg-white"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          {(service ? parseJson(service.services) : []).map((s: string) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Date picker */}
      <div className="mb-4">
        <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Дата</label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {nextDays.map((day, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDay(i); setSelectedTime(null); }}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                selectedDay === i
                  ? "bg-brand text-white shadow-brand"
                  : "glass text-text-muted hover:text-prussian hover:bg-prussian/[0.06]"
              }`}
            >
              <span>{dayLabels[day.getDay()]}</span>
              <span className="text-base font-bold mt-0.5">{day.getDate()}</span>
              <span className="text-[10px] opacity-70">{monthLabels[day.getMonth()]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-4">
        <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Время</label>
        {service?.timeSlots[0]?.time === "Без записи" ? (
          <div className="tag-green text-sm">Без записи, приезжайте в любое время</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {service?.timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`py-2 rounded-xl text-sm transition-all duration-200 ${
                  !slot.available
                    ? "opacity-30 cursor-not-allowed glass text-text-muted"
                    : selectedTime === slot.time
                    ? "bg-brand text-white shadow-brand"
                    : "glass text-text-muted hover:text-prussian hover:bg-prussian/[0.06]"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name + phone */}
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Имя</label>
          <input
            className={`input-field text-sm ${nameError ? "border-red-500/50" : ""}`}
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Телефон</label>
          <input
            className={`input-field text-sm ${phoneError ? "border-red-500/50" : ""}`}
            placeholder="+7 (___) ___-__-__"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
        </div>
      </div>

      <button
        onClick={handleBook}
        disabled={!selectedTime || !name || !phone || booking}
        className={`w-full btn-primary flex items-center justify-center gap-2 ${
          (!selectedTime || !name || !phone || booking) ? "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none" : ""
        }`}
      >
        {booking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Подтвердить запись
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {(!selectedTime || !name || !phone) && !booking && (
        <p className="text-xs text-text-dim mt-2 text-center">
          {!selectedTime ? "Выберите время" : !name ? "Введите имя" : "Введите телефон"}
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!service) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-text mb-2">Сервис не найден</h2>
          <Link href="/services" className="btn-ghost mt-4 inline-flex">
            Вернуться к каталогу
          </Link>
        </div>
      </AppLayout>
    );
  }

  const servicesList = parseJson(service.services);
  const photosList = parseJson(service.photos);
  const selectedCar = cars.find((c) => c.id === selectedCarId);

  if (booked) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">Запись подтверждена!</h2>
          <div className="glass rounded-2xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Сервис</span>
              <span className="text-text font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Услуга</span>
              <span className="text-text font-medium">{selectedService}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Дата</span>
              <span className="text-text font-medium">
                {nextDays[selectedDay].getDate()} {monthLabels[nextDays[selectedDay].getMonth()]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Время</span>
              <span className="text-text font-medium">{selectedTime}</span>
            </div>
            {selectedCar && (
              <div className="flex justify-between">
                <span className="text-text-muted">Автомобиль</span>
                <span className="text-text font-medium">{selectedCar.make} {selectedCar.model}</span>
              </div>
            )}
          </div>
          <p className="text-text-muted text-sm mb-6">
            Подтверждение отправлено. Напоминание придёт за 24 часа.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/garage" className="btn-primary">
              В мой гараж
            </Link>
            <Link href="/services" className="btn-ghost">
              К сервисам
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back */}
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Все сервисы
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="card-surface">
            <div className="h-56 rounded-xl overflow-hidden bg-bg-elevated mb-5 relative">
              <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              {service.verified && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-sm text-emerald-400">
                  <Shield className="w-4 h-4" />
                  Проверенный сервис
                </div>
              )}
            </div>

            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-text mb-1">{service.name}</h1>
                <span className={`tag text-xs ${serviceTypeColors[service.type] || ""}`}>
                  {service.typeName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "border-prussian/[0.08] text-text-dim hover:border-red-500/20 hover:text-red-400"
                  }`}
                  title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="text-xl font-bold text-text">{service.rating}</span>
                  </div>
                  <span className="text-text-muted text-sm">
                    ({service.reviewCount} отзывов)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm text-text-muted mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-light flex-shrink-0" />
                {service.address}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-light flex-shrink-0" />
                <span>{service.hours}</span>
                {(() => {
                  const hour = new Date().getHours();
                  const hoursMatch = service.hours.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
                  if (hoursMatch) {
                    const openH = parseInt(hoursMatch[1]);
                    const closeH = parseInt(hoursMatch[3]);
                    const isOpen = hour >= openH && hour < closeH;
                    return (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {isOpen ? "Открыто" : "Закрыто"}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-light flex-shrink-0" />
                {service.phone}
              </div>
            </div>

            {service.ownerId && authStatus === "authenticated" && (
              <Link
                href={`/messages?with=${service.ownerId}&name=${encodeURIComponent(service.name)}`}
                className="inline-flex items-center gap-2 btn-secondary text-sm !py-2 mb-4"
              >
                <MessageSquare className="w-4 h-4" />
                Написать сервису
              </Link>
            )}

            <p className="text-text-muted text-sm leading-relaxed">{service.description}</p>
          </div>

          {/* Mobile Booking — shown only on mobile, before services list */}
          <div className="lg:hidden">
            {renderBookingForm()}
          </div>

          {/* Services list */}
          <div className="card-surface">
            <h2 className="font-semibold text-text mb-4">Услуги</h2>
            <div className="flex flex-wrap gap-2">
              {servicesList.map((s: string) => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-bg-elevated text-text-muted text-sm border border-prussian/[0.05] hover:border-brand/30 hover:text-brand-light transition-colors cursor-default">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Prices */}
          <div className="card-surface">
            <h2 className="font-semibold text-text mb-4">Прайс-лист</h2>
            <div className="space-y-2">
              {service.priceList.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2.5 border-b border-prussian/[0.05] last:border-0">
                  <span className="text-text-muted text-sm">{item.name}</span>
                  <span className="font-semibold text-text text-sm">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          {photosList.length > 0 && (
            <div className="card-surface">
              <h2 className="font-semibold text-text mb-4">Галерея работ</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photosList.map((photo: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="aspect-video rounded-xl overflow-hidden bg-bg-elevated cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img src={photo} alt="Работа" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox */}
          {lightboxIndex !== null && photosList.length > 0 && (
            <div
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
                onClick={() => setLightboxIndex(null)}
              >
                <X className="w-8 h-8" />
              </button>
              {photosList.length > 1 && (
                <>
                  <button
                    className="absolute left-4 text-white/70 hover:text-white transition-colors z-10 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((lightboxIndex - 1 + photosList.length) % photosList.length);
                    }}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    className="absolute right-14 text-white/70 hover:text-white transition-colors z-10 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((lightboxIndex + 1) % photosList.length);
                    }}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
              <img
                src={photosList[lightboxIndex]}
                alt="Фото"
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-4 text-white/50 text-sm">
                {lightboxIndex + 1} / {photosList.length}
              </div>
            </div>
          )}

          {/* Reviews */}
          {service.reviews.length > 0 && (
            <div className="card-surface">
              <h2 className="font-semibold text-text mb-4">Отзывы клиентов</h2>
              <div className="space-y-4">
                {service.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-prussian/[0.05] last:border-0 last:pb-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-brand/30 flex items-center justify-center text-sm font-bold text-brand-light flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text text-sm">{review.author}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-accent fill-accent" : "text-text-dim"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-text-muted">
                          {review.carModel} · {new Date(review.date).toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed pl-12">{review.text}</p>
                    {review.reply && (
                      <div className="ml-12 mt-2 pl-4 border-l-2 border-brand/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-3.5 h-3.5 text-brand" />
                          <span className="text-xs font-medium text-brand">Ответ сервиса</span>
                        </div>
                        <p className="text-sm text-text-muted">{review.reply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Similar services */}
          {similarServices.length > 0 && (
            <div className="card-surface">
              <h2 className="font-semibold text-text mb-4">Похожие сервисы</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {similarServices.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.id}`}
                    className="rounded-xl border border-[var(--border)] hover:border-brand/30 hover:-translate-y-0.5 transition-all overflow-hidden group"
                  >
                    <div className="h-28 bg-bg-elevated overflow-hidden">
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-text truncate group-hover:text-brand-light transition-colors">
                        {s.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">{s.typeName}</span>
                        <span className="flex items-center gap-0.5 text-xs ml-auto">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <span className="font-medium text-text">{s.rating}</span>
                          <span className="text-text-dim">({s.reviewCount})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-text-dim">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking — desktop only */}
        <div className="hidden lg:block space-y-4">
          <div className="lg:sticky lg:top-20">
            {renderBookingForm()}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
