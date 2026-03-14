"use client";

import { useState, useEffect } from "react";
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

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("autoeco_cart") || "[]");
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("autoeco_cart", JSON.stringify(items));
}

export default function PartsPage() {
  const { status: authStatus } = useSession();
  const [query, setQuery] = useState("");
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [category, setCategory] = useState("Все категории");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    setCart(loadCart());
  }, []);

  const addedToCart = cart.map((c) => c.offerId);

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

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-1">Подбор запчастей</h1>
        <p className="text-text-muted">Точный подбор по VIN с агрегацией цен</p>
      </div>

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
                    <div>
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
              <button className="btn-primary w-full justify-center text-sm !py-3">
                Оформить заказ
              </button>
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
