"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  ShoppingCart,
  ChevronLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  X,
  Plus,
  Minus,
} from "lucide-react";

interface CartItem {
  offerId: string;
  partName: string;
  brand: string;
  price: number;
  seller: string;
  partNumber: string;
  quantity?: number;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("autoeco_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("autoeco_cart", JSON.stringify(items));
}

export default function CheckoutPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    setCart(loadCart());
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user.name || "",
        email: prev.email || session.user.email || "",
      }));
    }
  }, [authStatus, session]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (offerId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.offerId === offerId) {
        const qty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: qty };
      }
      return item;
    });
    setCart(updated);
    saveCart(updated);
  };

  const removeItem = (offerId: string) => {
    const updated = cart.filter((c) => c.offerId !== offerId);
    setCart(updated);
    saveCart(updated);
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Корзина пуста");
      return;
    }

    if (!form.name || !form.phone || !form.address) {
      setError("Заполните имя, телефон и адрес доставки");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            partOfferId: item.offerId,
            quantity: item.quantity || 1,
          })),
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          comment: form.comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при оформлении заказа");
        setLoading(false);
        return;
      }

      // Clear cart
      saveCart([]);
      setCart([]);
      setOrderId(data.id);
      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
      setLoading(false);
    }
  };

  if (authStatus === "unauthenticated") {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <ShoppingCart className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">Войдите для оформления заказа</h2>
          <Link href="/auth/login" className="btn-primary mt-4 inline-flex">
            Войти
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (success) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Заказ оформлен!</h1>
          <p className="text-text-muted mb-1">Номер заказа: <span className="font-mono text-text">{orderId.slice(-8).toUpperCase()}</span></p>
          <p className="text-text-dim text-sm mb-8">
            Мы свяжемся с вами для подтверждения в ближайшее время
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/orders" className="btn-primary text-sm flex items-center gap-2">
              Мои заказы <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/parts" className="btn-secondary text-sm">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        href="/parts"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Назад к запчастям
      </Link>

      <h1 className="text-2xl font-bold text-text mb-6">Оформление заказа</h1>

      {cart.length === 0 ? (
        <div className="card-surface text-center py-12">
          <ShoppingCart className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted mb-4">Корзина пуста</p>
          <Link href="/parts" className="btn-primary text-sm inline-flex items-center gap-2">
            Перейти к запчастям <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Contact info */}
              <div className="card-surface">
                <h2 className="text-lg font-semibold text-text mb-4">Контактные данные</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Имя *</label>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Телефон *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className="input-field text-sm !pl-10"
                          placeholder="+7 (999) 123-45-67"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          className="input-field text-sm !pl-10"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="card-surface">
                <h2 className="text-lg font-semibold text-text mb-4">Доставка</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Адрес доставки *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-dim" />
                      <textarea
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        className="input-field text-sm !pl-10 min-h-[60px] resize-none"
                        placeholder="Город, улица, дом, квартира"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Комментарий</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-text-dim" />
                      <textarea
                        value={form.comment}
                        onChange={(e) => updateField("comment", e.target.value)}
                        className="input-field text-sm !pl-10 min-h-[60px] resize-none"
                        placeholder="Дополнительная информация для курьера..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit (mobile) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-sm !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Оформляем...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Подтвердить заказ · {total.toLocaleString("ru")} ₽
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Cart summary sidebar */}
          <div>
            <div className="card-surface sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-semibold text-text">Корзина</h2>
                <span className="text-sm text-text-muted">({cart.length})</span>
              </div>

              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.offerId} className="flex gap-3 p-3 rounded-xl bg-prussian/[0.02] border border-border">
                    <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-brand-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{item.partName}</p>
                      <p className="text-xs text-text-dim">{item.brand} · {item.seller}</p>
                      <p className="text-[10px] text-text-dim font-mono">{item.partNumber}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.offerId, -1)}
                            className="w-6 h-6 rounded-md bg-prussian/[0.06] flex items-center justify-center hover:bg-prussian/[0.1] transition-colors"
                          >
                            <Minus className="w-3 h-3 text-text-muted" />
                          </button>
                          <span className="text-xs font-medium text-text w-4 text-center">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item.offerId, 1)}
                            className="w-6 h-6 rounded-md bg-prussian/[0.06] flex items-center justify-center hover:bg-prussian/[0.1] transition-colors"
                          >
                            <Plus className="w-3 h-3 text-text-muted" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-text">
                          {(item.price * (item.quantity || 1)).toLocaleString("ru")} ₽
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.offerId)}
                      className="p-1 rounded hover:bg-red-500/10 transition-colors self-start"
                    >
                      <X className="w-3.5 h-3.5 text-text-dim hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Товары ({cart.reduce((s, c) => s + (c.quantity || 1), 0)} шт.)</span>
                  <span className="font-bold text-text">{total.toLocaleString("ru")} ₽</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-dim">Доставка</span>
                  <span className="text-emerald-400 text-sm">Бесплатно</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-text">Итого</span>
                  <span className="text-xl font-bold text-text">{total.toLocaleString("ru")} ₽</span>
                </div>

                {/* Submit (desktop) */}
                <button
                  onClick={() => {
                    // Trigger form validation and submit
                    const form = document.querySelector('form');
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                  disabled={loading}
                  className="hidden lg:flex btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Оформляем...
                    </span>
                  ) : (
                    "Подтвердить заказ"
                  )}
                </button>

                <button
                  onClick={() => {
                    saveCart([]);
                    setCart([]);
                  }}
                  className="w-full text-center text-xs text-text-dim hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Очистить корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
