"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Search,
  Package,
  Truck,
  Star,
  CheckCircle2,
  Clock,
  Car,
  ShoppingCart,
  Loader2,
  X,
  Trash2,
  Heart,
  MapPin,
  Store,
  Sparkles,
  Zap,
} from "lucide-react";

const categories = [
  "Все категории",
  "Техобслуживание",
  "Тормозная система",
  "Двигатель",
  "Электрооборудование",
  "Ходовая часть",
  "Кузов",
];

const typeColors: Record<string, string> = {
  original: "bg-brand/10 text-brand border border-brand/15",
  oem: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/15",
  analog: "bg-prussian/[0.04] text-text-muted border border-prussian/[0.08]",
};

// Category icons for feed cards
const categoryIconMap: Record<string, string> = {
  "Техобслуживание": "🔧",
  "Тормозная система": "🛑",
  "Двигатель": "⚙️",
  "Электрооборудование": "⚡",
  "Ходовая часть": "🔩",
  "Кузов": "🚗",
};

const categoryGradientMap: Record<string, string> = {
  "Техобслуживание": "from-blue-500/20 to-blue-600/10",
  "Тормозная система": "from-red-500/20 to-red-600/10",
  "Двигатель": "from-orange-500/20 to-orange-600/10",
  "Электрооборудование": "from-yellow-500/20 to-yellow-600/10",
  "Ходовая часть": "from-purple-500/20 to-purple-600/10",
  "Кузов": "from-emerald-500/20 to-emerald-600/10",
};

interface PartOffer {
  id: string;
  seller: string;
  sellerLogo: string;
  brand: string;
  type: string;
  typeName: string;
  price: number;
  deliveryDays: number;
  inStock: boolean;
  warranty: string;
  partNumber: string;
  rating: number | null;
}

interface Part {
  id: string;
  name: string;
  category: string;
  compatibleCars: string;
  description: string;
  offers: PartOffer[];
}

interface CarItem {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
}

interface CartItem {
  offerId: string;
  partName: string;
  brand: string;
  price: number;
  seller: string;
  partNumber: string;
}

interface RecommendedPart {
  id: string;
  name: string;
  category: string;
  image: string;
  priceFrom: number;
  priceTo: number;
  compatibility: string[];
  brand: string;
}

interface PartsShop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  availability: string;
  availabilityColor: string;
  phone: string;
  hours: string;
}

// --- Mock data: recommended parts (30+ items) ---
const allRecommendedParts: RecommendedPart[] = [
  { id: "rec-1", name: "Масло моторное 5W-30 синтетика", category: "Техобслуживание", image: "OIL", priceFrom: 1890, priceTo: 3200, compatibility: ["Toyota", "Hyundai", "Kia"], brand: "Castrol" },
  { id: "rec-2", name: "Фильтр масляный", category: "Техобслуживание", image: "FLT", priceFrom: 250, priceTo: 890, compatibility: ["Toyota Camry", "RAV4"], brand: "Mann" },
  { id: "rec-3", name: "Колодки тормозные передние", category: "Тормозная система", image: "BRK", priceFrom: 1200, priceTo: 4500, compatibility: ["Hyundai Solaris", "Kia Rio"], brand: "TRW" },
  { id: "rec-4", name: "Лампа H7 12V 55W", category: "Электрооборудование", image: "BLB", priceFrom: 190, priceTo: 850, compatibility: ["Универсальная"], brand: "Osram" },
  { id: "rec-5", name: "Дворники бескаркасные 600мм", category: "Кузов", image: "WPR", priceFrom: 490, priceTo: 1600, compatibility: ["Универсальные"], brand: "Bosch" },
  { id: "rec-6", name: "Фильтр воздушный", category: "Техобслуживание", image: "AIR", priceFrom: 320, priceTo: 1100, compatibility: ["Toyota Camry", "Corolla"], brand: "Mahle" },
  { id: "rec-7", name: "Антифриз G12+ красный 5л", category: "Техобслуживание", image: "CLN", priceFrom: 890, priceTo: 2100, compatibility: ["Универсальный"], brand: "Felix" },
  { id: "rec-8", name: "Диски тормозные передние", category: "Тормозная система", image: "DSC", priceFrom: 2500, priceTo: 7800, compatibility: ["Kia Sportage", "Hyundai Tucson"], brand: "Brembo" },
  { id: "rec-9", name: "Свечи зажигания иридиевые", category: "Двигатель", image: "SPK", priceFrom: 450, priceTo: 1200, compatibility: ["Toyota", "Honda", "Mazda"], brand: "NGK" },
  { id: "rec-10", name: "Ремень ГРМ комплект", category: "Двигатель", image: "BLT", priceFrom: 3200, priceTo: 8900, compatibility: ["Hyundai Solaris", "Kia Rio"], brand: "Gates" },
  { id: "rec-11", name: "Амортизатор передний", category: "Ходовая часть", image: "SHK", priceFrom: 2800, priceTo: 6500, compatibility: ["Toyota Camry XV70"], brand: "KYB" },
  { id: "rec-12", name: "Фильтр салонный угольный", category: "Техобслуживание", image: "CBN", priceFrom: 380, priceTo: 1400, compatibility: ["Универсальный"], brand: "Mann" },
  { id: "rec-13", name: "Масло трансмиссионное ATF", category: "Техобслуживание", image: "ATF", priceFrom: 1200, priceTo: 3800, compatibility: ["Toyota", "Lexus"], brand: "Aisin" },
  { id: "rec-14", name: "Лампа LED H11 противотуманная", category: "Электрооборудование", image: "LED", priceFrom: 890, priceTo: 2400, compatibility: ["Универсальная"], brand: "Philips" },
  { id: "rec-15", name: "Стойка стабилизатора", category: "Ходовая часть", image: "STB", priceFrom: 450, priceTo: 1800, compatibility: ["Hyundai", "Kia"], brand: "CTR" },
  { id: "rec-16", name: "Колодки тормозные задние", category: "Тормозная система", image: "BRR", priceFrom: 900, priceTo: 3200, compatibility: ["Toyota RAV4", "Camry"], brand: "Ate" },
  { id: "rec-17", name: "Термостат двигателя", category: "Двигатель", image: "TRM", priceFrom: 680, priceTo: 2500, compatibility: ["Toyota", "Nissan"], brand: "Wahler" },
  { id: "rec-18", name: "Подшипник ступицы передней", category: "Ходовая часть", image: "BRG", priceFrom: 1500, priceTo: 4200, compatibility: ["Kia Rio", "Hyundai Solaris"], brand: "SKF" },
  { id: "rec-19", name: "Жидкость тормозная DOT-4", category: "Тормозная система", image: "DOT", priceFrom: 290, priceTo: 780, compatibility: ["Универсальная"], brand: "Castrol" },
  { id: "rec-20", name: "Щётки стеклоочистителя задние", category: "Кузов", image: "RWP", priceFrom: 350, priceTo: 1100, compatibility: ["Toyota RAV4", "Kia Sportage"], brand: "Valeo" },
  { id: "rec-21", name: "Фильтр топливный", category: "Техобслуживание", image: "FUL", priceFrom: 420, priceTo: 1500, compatibility: ["Hyundai", "Kia"], brand: "Bosch" },
  { id: "rec-22", name: "Шаровая опора нижняя", category: "Ходовая часть", image: "BLJ", priceFrom: 650, priceTo: 2800, compatibility: ["Toyota Camry", "Corolla"], brand: "555" },
  { id: "rec-23", name: "Помпа водяная", category: "Двигатель", image: "PMP", priceFrom: 1800, priceTo: 5500, compatibility: ["Hyundai", "Kia"], brand: "GMB" },
  { id: "rec-24", name: "Аккумулятор 60Ah", category: "Электрооборудование", image: "BAT", priceFrom: 4500, priceTo: 9800, compatibility: ["Универсальный"], brand: "Varta" },
  { id: "rec-25", name: "Сайлентблок переднего рычага", category: "Ходовая часть", image: "SLB", priceFrom: 280, priceTo: 950, compatibility: ["Toyota", "Lexus"], brand: "Febest" },
  { id: "rec-26", name: "Масло моторное 0W-20 синтетика", category: "Техобслуживание", image: "OW2", priceFrom: 2100, priceTo: 4200, compatibility: ["Toyota", "Honda"], brand: "Toyota Genuine" },
  { id: "rec-27", name: "Трос ручного тормоза", category: "Тормозная система", image: "CBL", priceFrom: 480, priceTo: 1600, compatibility: ["Hyundai Solaris", "Kia Rio"], brand: "Cofle" },
  { id: "rec-28", name: "Ремень поликлиновой", category: "Двигатель", image: "RBT", priceFrom: 650, priceTo: 2200, compatibility: ["Универсальный"], brand: "Gates" },
  { id: "rec-29", name: "Катушка зажигания", category: "Двигатель", image: "IGN", priceFrom: 1200, priceTo: 4500, compatibility: ["Toyota Camry", "RAV4"], brand: "Denso" },
  { id: "rec-30", name: "Крышка радиатора", category: "Двигатель", image: "RAD", priceFrom: 180, priceTo: 650, compatibility: ["Универсальная"], brand: "Tama" },
  { id: "rec-31", name: "Датчик кислорода лямбда", category: "Двигатель", image: "O2S", priceFrom: 1800, priceTo: 5200, compatibility: ["Toyota", "Hyundai", "Kia"], brand: "Bosch" },
  { id: "rec-32", name: "Насос гидроусилителя руля", category: "Ходовая часть", image: "PSP", priceFrom: 4200, priceTo: 11000, compatibility: ["Toyota Camry XV40"], brand: "Kayaba" },
];

// --- Mock data: shops in Samara ---
const samaraShops: PartsShop[] = [
  { id: "shop-1", name: "АвтоМир", address: "ул. Ново-Садовая, 305", lat: 53.2121, lng: 50.1412, availability: "В наличии", availabilityColor: "text-emerald-400", phone: "+7 (846) 221-33-44", hours: "9:00-20:00" },
  { id: "shop-2", name: "Exist Самара", address: "Московское шоссе, 17", lat: 53.1953, lng: 50.1137, availability: "В наличии", availabilityColor: "text-emerald-400", phone: "+7 (846) 277-55-66", hours: "9:00-21:00" },
  { id: "shop-3", name: "Emex", address: "ул. Авроры, 114", lat: 53.2040, lng: 50.1590, availability: "1-2 дня", availabilityColor: "text-amber-400", phone: "+7 (846) 200-11-22", hours: "10:00-19:00" },
  { id: "shop-4", name: "Автозапчасти 63", address: "ул. Мичурина, 52", lat: 53.1880, lng: 50.0950, availability: "В наличии", availabilityColor: "text-emerald-400", phone: "+7 (846) 333-44-55", hours: "8:00-20:00" },
  { id: "shop-5", name: "Запчасти Онлайн", address: "ул. Гагарина, 78", lat: 53.2200, lng: 50.1700, availability: "Под заказ", availabilityColor: "text-text-dim", phone: "+7 (846) 244-66-77", hours: "10:00-18:00" },
  { id: "shop-6", name: "Autodoc Самара", address: "пр. Кирова, 228", lat: 53.2300, lng: 50.1850, availability: "1-2 дня", availabilityColor: "text-amber-400", phone: "+7 (846) 255-88-99", hours: "9:00-20:00" },
];

// --- localStorage helpers ---
function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("autoeco_cart") || "[]");
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("autoeco_cart", JSON.stringify(items));
}

function loadSavedParts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("saved-parts") || "[]");
  } catch { return []; }
}

function saveSavedParts(ids: string[]) {
  localStorage.setItem("saved-parts", JSON.stringify(ids));
}

// Window.ymaps types are in src/types/ymaps.d.ts

// --- Shop Map Component ---
function ShopMap({ shops }: { shops: PartsShop[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (shops.length === 0) { setError(true); return; }

    if (window.ymaps) {
      window.ymaps.ready(() => initMap());
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YMAPS_KEY || ""}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => initMap());
      }
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops]);

  function initMap() {
    if (!mapRef.current || !window.ymaps) return;
    const ymaps = window.ymaps;

    const avgLat = shops.reduce((s, c) => s + c.lat, 0) / shops.length;
    const avgLng = shops.reduce((s, c) => s + c.lng, 0) / shops.length;

    const map = new ymaps.Map(mapRef.current, {
      center: [avgLat, avgLng],
      zoom: 12,
      controls: ["zoomControl"],
    });

    for (const s of shops) {
      const placemark = new ymaps.Placemark(
        [s.lat, s.lng],
        {
          balloonContentHeader: `<strong>${s.name}</strong>`,
          balloonContentBody: `
            <div style="font-size:13px;color:#666">
              <div>${s.address}</div>
              <div style="margin-top:4px">${s.availability} · ${s.hours}</div>
              <div style="margin-top:4px">${s.phone}</div>
            </div>
          `,
          hintContent: s.name,
        },
        { preset: "islands#violetDotIcon" }
      );
      (map as unknown as { geoObjects: { add: (p: unknown) => void } }).geoObjects.add(placemark);
    }

    setLoaded(true);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        <MapPin className="w-12 h-12 text-text-dim mb-4" />
        <p className="text-text-muted font-medium mb-1">Карта недоступна</p>
        <p className="text-text-dim text-sm">Не удалось загрузить карту</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-surface)] rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl overflow-hidden border border-[var(--border)]"
      />
    </div>
  );
}

// --- Feed Card Component ---
function FeedCard({
  rec,
  inCart,
  isSaved,
  onToggleSave,
  onAddToCart,
}: {
  rec: RecommendedPart;
  inCart: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddToCart: (rec: RecommendedPart) => void;
}) {
  const icon = categoryIconMap[rec.category] || "📦";
  const gradient = categoryGradientMap[rec.category] || "from-brand/20 to-brand/10";

  return (
    <div className="card-surface !p-0 overflow-hidden flex flex-col group">
      {/* Image placeholder */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center border-b border-prussian/[0.04]`}>
        <span className="text-3xl mb-1 select-none">{icon}</span>
        <span className="text-xs font-bold text-text-dim/50 tracking-wider select-none">{rec.image}</span>
        {/* Bookmark */}
        <button
          onClick={() => onToggleSave(rec.id)}
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
            isSaved
              ? "bg-red-500/15 text-red-400"
              : "bg-black/20 backdrop-blur-sm text-white/70 hover:text-red-400 hover:bg-red-500/15 opacity-0 group-hover:opacity-100"
          }`}
          aria-label={isSaved ? "Убрать из избранного" : "В избранное"}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-400" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/15 font-medium">
            {rec.category}
          </span>
        </div>
        <div className="text-xs text-text-dim mb-1">{rec.brand}</div>
        <h4 className="text-sm font-medium text-text mb-2 leading-snug line-clamp-2 flex-1">
          {rec.name}
        </h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {rec.compatibility.slice(0, 2).map((c) => (
            <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/15">
              {c}
            </span>
          ))}
          {rec.compatibility.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-prussian/[0.04] text-text-dim">
              +{rec.compatibility.length - 2}
            </span>
          )}
        </div>
        <div className="text-text font-bold text-sm mb-2">
          {rec.priceFrom.toLocaleString("ru")} — {rec.priceTo.toLocaleString("ru")} ₽
        </div>
        <button
          onClick={() => onAddToCart(rec)}
          className={`w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            inCart
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/15"
              : "btn-primary"
          }`}
        >
          {inCart ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              В корзине
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              В корзину
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function PartsPage() {
  const { status: authStatus } = useSession();

  // Mode toggle: "search" | "feed"
  const [mode, setMode] = useState<"search" | "feed">("search");

  // Search mode state
  const [query, setQuery] = useState("");
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [category, setCategory] = useState("Все категории");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Bookmarks
  const [savedParts, setSavedParts] = useState<string[]>([]);

  // Feed mode: infinite scroll
  const [feedVisible, setFeedVisible] = useState(8);
  const [feedLoading, setFeedLoading] = useState(false);

  // Load cart & bookmarks from localStorage
  useEffect(() => {
    setCart(loadCart());
    setSavedParts(loadSavedParts());
  }, []);

  const addedToCart = cart.map((c) => c.offerId);

  const toggleSavedPart = (partId: string) => {
    setSavedParts((prev) => {
      const next = prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId];
      saveSavedParts(next);
      return next;
    });
  };

  // Load cars from API
  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/cars")
        .then((res) => res.json())
        .then((data) => {
          setCars(data);
          if (data.length > 0) setSelectedCar(data[0]);
        })
        .catch(() => {});
    }
  }, [authStatus]);

  // Load initial parts
  useEffect(() => {
    fetch("/api/parts")
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  // Feed: IntersectionObserver for infinite scroll
  const feedVisibleRef = useRef(feedVisible);
  const feedLoadingRef = useRef(feedLoading);
  useEffect(() => { feedVisibleRef.current = feedVisible; }, [feedVisible]);
  useEffect(() => { feedLoadingRef.current = feedLoading; }, [feedLoading]);

  const loadMoreFeed = useCallback(() => {
    if (feedVisibleRef.current >= allRecommendedParts.length || feedLoadingRef.current) return;
    setFeedLoading(true);
    setTimeout(() => {
      setFeedVisible((prev) => Math.min(prev + 8, allRecommendedParts.length));
      setFeedLoading(false);
    }, 500);
  }, []);

  const feedSentinelCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreFeed(); },
      { rootMargin: "200px" }
    );
    observer.observe(node);
  }, [loadMoreFeed]);

  const handleSearch = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (selectedCar) params.set("car", `${selectedCar.make} ${selectedCar.model}`);

    fetch(`/api/parts?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setSearched(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const handleAddCart = (offerId: string, partName: string, offer: PartOffer) => {
    if (addedToCart.includes(offerId)) return;
    const newCart = [...cart, { offerId, partName, brand: offer.brand, price: offer.price, seller: offer.seller, partNumber: offer.partNumber }];
    setCart(newCart);
    saveCart(newCart);
  };

  const handleAddRecToCart = (rec: RecommendedPart) => {
    const offerId = `rec-cart-${rec.id}`;
    if (addedToCart.includes(offerId)) return;
    const newCart = [...cart, { offerId, partName: rec.name, brand: rec.brand, price: rec.priceFrom, seller: "Рекомендация", partNumber: rec.id }];
    setCart(newCart);
    saveCart(newCart);
  };

  const handleRemoveFromCart = (offerId: string) => {
    const newCart = cart.filter((c) => c.offerId !== offerId);
    setCart(newCart);
    saveCart(newCart);
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price, 0);

  const parseCompatibleCars = (str: string): string[] => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const filteredResults =
    category === "Все категории"
      ? results
      : results.filter((p) => p.category === category);

  const visibleFeedItems = allRecommendedParts.slice(0, feedVisible);

  return (
    <AppLayout>
      {/* Page header with mode toggle */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Подбор запчастей</h1>
          <p className="text-text-muted">
            {mode === "search"
              ? "Точный подбор по VIN с агрегацией цен"
              : "Лента популярных запчастей и расходников"}
          </p>
        </div>

        {/* Mode toggle pill */}
        <div className="flex items-center p-1 rounded-xl glass border border-prussian/[0.08] flex-shrink-0 self-start mt-1">
          <button
            onClick={() => setMode("search")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "search"
                ? "bg-brand text-white shadow-brand"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Поиск
          </button>
          <button
            onClick={() => setMode("feed")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "feed"
                ? "bg-brand text-white shadow-brand"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Лента
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODE 1: Search */}
      {/* ============================================ */}
      {mode === "search" && (
        <>
          {/* Search panel */}
          <div className="card-surface mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Car selector */}
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                  Автомобиль
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  {cars.length > 0 ? (
                    <select
                      className="input-field pl-10 text-sm"
                      value={selectedCar?.id || ""}
                      onChange={(e) => {
                        const car = cars.find((c) => c.id === e.target.value);
                        if (car) setSelectedCar(car);
                      }}
                    >
                      {cars.map((car) => (
                        <option key={car.id} value={car.id} className="bg-white">
                          {car.make} {car.model} {car.year} · VIN {car.vin.slice(-6)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input-field pl-10 text-sm"
                      placeholder="Войдите для выбора авто из гаража"
                      disabled
                    />
                  )}
                </div>
              </div>

              {/* Part search */}
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                  Поиск запчасти
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input
                      className="input-field pl-10 text-sm"
                      placeholder="Название, артикул или каталожный номер..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <button onClick={handleSearch} className="btn-primary px-5 flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* VIN display */}
            {selectedCar && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-prussian/[0.03] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-text-muted">
                  VIN: <span className="font-mono text-text">{selectedCar.vin}</span>
                </span>
                <span className="text-text-muted">·</span>
                <span className="text-text-muted">
                  Подбор для <span className="text-text">{selectedCar.make} {selectedCar.model} {selectedCar.year}</span>
                </span>
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? "bg-brand text-white shadow-brand"
                    : "glass text-text-muted hover:text-text hover:bg-prussian/[0.06]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : (
            <>
              {searched && (
                <div className="text-text-muted text-sm mb-4">
                  Найдено: <span className="text-text font-medium">{filteredResults.length}</span> запчастей
                  {query && <span> по запросу «{query}»</span>}
                  {selectedCar && (
                    <span> для <span className="text-text">{selectedCar.make} {selectedCar.model}</span></span>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {filteredResults.map((part) => {
                  const compatCars = parseCompatibleCars(part.compatibleCars);
                  return (
                    <div key={part.id} className="card-surface">
                      {/* Part header */}
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                              <Package className="w-4 h-4 text-brand-light" />
                            </div>
                            <h3 className="font-semibold text-text">{part.name}</h3>
                            <span className="tag text-xs bg-prussian/[0.03] text-text-muted border border-prussian/[0.08]">
                              {part.category}
                            </span>
                          </div>
                          <p className="text-text-muted text-sm pl-11">{part.description}</p>
                          <div className="pl-11 mt-1.5 flex flex-wrap gap-1.5">
                            {compatCars.map((c: string) => (
                              <span key={c} className="text-xs text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Bookmark button */}
                        <button
                          onClick={() => toggleSavedPart(part.id)}
                          className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                            savedParts.includes(part.id)
                              ? "bg-red-500/15 text-red-400"
                              : "glass hover:bg-red-500/10 hover:text-red-400 text-text-dim"
                          }`}
                          title={savedParts.includes(part.id) ? "Убрать из избранного" : "В избранное"}
                        >
                          <Heart className={`w-4 h-4 ${savedParts.includes(part.id) ? "fill-red-400" : ""}`} />
                        </button>
                      </div>

                      {/* Offers table */}
                      <div className="space-y-2">
                        {/* Desktop header */}
                        <div className="hidden md:grid grid-cols-5 gap-2 px-4 py-2 text-xs text-text-dim uppercase tracking-wider">
                          <div className="col-span-2">Производитель / Продавец</div>
                          <div>Тип</div>
                          <div>Доставка</div>
                          <div className="text-right">Цена</div>
                        </div>

                        {part.offers.map((offer) => (
                          <div key={offer.id}>
                            {/* Desktop row */}
                            <div
                              className={`hidden md:grid grid-cols-5 gap-2 px-4 py-3 rounded-xl items-center transition-all hover:bg-prussian/[0.03] ${
                                !offer.inStock ? "opacity-50" : ""
                              }`}
                            >
                              <div className="col-span-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-xs font-bold text-text-muted flex-shrink-0">
                                  {offer.sellerLogo}
                                </div>
                                <div>
                                  <div className="text-text text-sm font-medium">{offer.brand}</div>
                                  <div className="text-text-muted text-xs flex items-center gap-2">
                                    {offer.seller}
                                    {offer.rating && (
                                      <span className="flex items-center gap-0.5">
                                        <Star className="w-3 h-3 text-accent fill-accent" />
                                        {offer.rating}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-text-dim text-xs font-mono">{offer.partNumber}</div>
                                </div>
                              </div>
                              <div>
                                <span className={`tag text-xs ${typeColors[offer.type] || ""}`}>
                                  {offer.typeName}
                                </span>
                              </div>
                              <div className="text-sm text-text-muted flex items-center gap-1.5">
                                {offer.inStock ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                                    {offer.deliveryDays === 1 ? "Завтра" : `${offer.deliveryDays} дня`}
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-text-dim" />
                                    Нет в наличии
                                  </>
                                )}
                              </div>
                              <div className="text-right flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-text font-bold">
                                    {offer.price.toLocaleString("ru")} ₽
                                  </div>
                                  <div className="text-text-dim text-xs">{offer.warranty}</div>
                                </div>
                                {offer.inStock ? (
                                  <button
                                    onClick={() => handleAddCart(offer.id, part.name, offer)}
                                    className={`p-2 rounded-xl transition-all ${
                                      addedToCart.includes(offer.id)
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "glass hover:bg-brand/20 hover:text-brand-light text-text-muted"
                                    }`}
                                  >
                                    {addedToCart.includes(offer.id) ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <ShoppingCart className="w-4 h-4" />
                                    )}
                                  </button>
                                ) : (
                                  <button className="p-2 rounded-xl glass text-text-dim cursor-not-allowed opacity-40">
                                    <ShoppingCart className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Mobile card */}
                            <div
                              className={`md:hidden rounded-xl p-4 border border-prussian/[0.04] transition-all ${
                                !offer.inStock ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-xs font-bold text-text-muted flex-shrink-0">
                                  {offer.sellerLogo}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-text text-sm font-medium">{offer.brand}</div>
                                  <div className="text-text-muted text-xs flex items-center gap-2">
                                    {offer.seller}
                                    {offer.rating && (
                                      <span className="flex items-center gap-0.5">
                                        <Star className="w-3 h-3 text-accent fill-accent" />
                                        {offer.rating}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-text-dim text-xs font-mono">{offer.partNumber}</div>
                                </div>
                                <span className={`tag text-xs ${typeColors[offer.type] || ""}`}>
                                  {offer.typeName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-text-muted flex items-center gap-1.5">
                                  {offer.inStock ? (
                                    <>
                                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                                      {offer.deliveryDays === 1 ? "Завтра" : `${offer.deliveryDays} дня`}
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3.5 h-3.5 text-text-dim" />
                                      Нет в наличии
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="text-text font-bold text-sm">
                                      {offer.price.toLocaleString("ru")} ₽
                                    </div>
                                    <div className="text-text-dim text-xs">{offer.warranty}</div>
                                  </div>
                                  {offer.inStock ? (
                                    <button
                                      onClick={() => handleAddCart(offer.id, part.name, offer)}
                                      className={`p-2 rounded-xl transition-all ${
                                        addedToCart.includes(offer.id)
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : "glass hover:bg-brand/20 hover:text-brand-light text-text-muted"
                                      }`}
                                    >
                                      {addedToCart.includes(offer.id) ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                      ) : (
                                        <ShoppingCart className="w-4 h-4" />
                                      )}
                                    </button>
                                  ) : (
                                    <button className="p-2 rounded-xl glass text-text-dim cursor-not-allowed opacity-40">
                                      <ShoppingCart className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredResults.length === 0 && !loading && (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-text-dim mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text mb-2">Запчасти не найдены</h3>
                  <p className="text-text-muted text-sm">Попробуйте другой запрос или измените фильтры</p>
                </div>
              )}
            </>
          )}

          {/* Shops map — Магазины рядом */}
          <div className="mt-12 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-brand-light" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Магазины рядом</h2>
                <p className="text-text-muted text-sm">Автозапчасти в Самаре</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <ShopMap shops={samaraShops} />
              </div>
              <div className="lg:col-span-2 space-y-3">
                {samaraShops.map((shop) => (
                  <div key={shop.id} className="card-surface !p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-brand-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-text truncate">{shop.name}</h4>
                        <span className={`text-xs font-medium flex-shrink-0 ${shop.availabilityColor}`}>{shop.availability}</span>
                      </div>
                      <p className="text-xs text-text-muted mb-1">{shop.address}</p>
                      <div className="flex items-center gap-3 text-xs text-text-dim">
                        <span>{shop.hours}</span>
                        <span>{shop.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}


      {/* ============================================ */}
      {/* MODE 2: Feed */}
      {/* ============================================ */}
      {mode === "feed" && (
        <div>
          {/* Feed header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-light" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Лента запчастей</h2>
              <p className="text-text-muted text-sm">
                {allRecommendedParts.length} товаров · Обновляется ежедневно
              </p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleFeedItems.map((rec) => {
              const recCartId = `rec-cart-${rec.id}`;
              const inCart = addedToCart.includes(recCartId);
              const isSaved = savedParts.includes(rec.id);

              return (
                <FeedCard
                  key={rec.id}
                  rec={rec}
                  inCart={inCart}
                  isSaved={isSaved}
                  onToggleSave={toggleSavedPart}
                  onAddToCart={handleAddRecToCart}
                />
              );
            })}
          </div>

          {/* Sentinel + loader */}
          {feedVisible < allRecommendedParts.length ? (
            <div ref={feedSentinelCallback} className="flex items-center justify-center py-10 gap-3">
              {feedLoading && (
                <>
                  <Loader2 className="w-5 h-5 text-brand animate-spin" />
                  <span className="text-text-muted text-sm">Загружаем ещё товары...</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-10 text-text-dim text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Все товары загружены
            </div>
          )}
        </div>
      )}

      {/* Floating cart button */}
      {cart.length > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 btn-primary !rounded-full !p-4 shadow-lg flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold">{cart.length}</span>
          <span className="hidden sm:inline text-sm">· {cartTotal.toLocaleString("ru")} ₽</span>
        </button>
      )}

      {/* Cart panel */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border)] shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-light" />
                <h2 className="text-lg font-bold text-text">Корзина</h2>
                <span className="text-sm text-text-muted">({cart.length})</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.map((item) => (
                <div key={item.offerId} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text truncate">{item.partName}</div>
                    <div className="text-xs text-text-muted mt-0.5">{item.brand} · {item.seller}</div>
                    <div className="text-xs text-text-dim font-mono mt-0.5">{item.partNumber}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-text">{item.price.toLocaleString("ru")} ₽</div>
                    <button
                      onClick={() => handleRemoveFromCart(item.offerId)}
                      className="text-red-400 hover:text-red-300 mt-1 p-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Итого:</span>
                <span className="text-xl font-bold text-text">{cartTotal.toLocaleString("ru")} ₽</span>
              </div>
              <a href="/checkout" className="btn-primary w-full justify-center text-sm !py-3 block text-center">
                Оформить заказ
              </a>
              <button
                onClick={() => { setCart([]); saveCart([]); setCartOpen(false); }}
                className="w-full text-center text-xs text-text-muted hover:text-red-400 transition-colors py-1"
              >
                Очистить корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
