"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingCart,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OrderItem {
  id: string;
  partName: string;
  seller: string;
  brand: string;
  partNumber: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  name: string;
  phone: string;
  address: string;
  comment: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Ожидает подтверждения", color: "text-amber-400 bg-amber-500/10", icon: Clock },
  confirmed: { label: "Подтверждён", color: "text-blue-400 bg-blue-500/10", icon: CheckCircle2 },
  shipped: { label: "В доставке", color: "text-purple-400 bg-purple-500/10", icon: Truck },
  delivered: { label: "Доставлен", color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
  cancelled: { label: "Отменён", color: "text-red-400 bg-red-500/10", icon: XCircle },
};

export default function OrdersPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
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

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Мои заказы</h1>
        <p className="text-text-muted text-sm mt-1">История заказов запчастей</p>
      </div>

      {orders.length === 0 ? (
        <div className="card-surface text-center py-16">
          <Package className="w-14 h-14 text-text-dim mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">Заказов пока нет</h2>
          <p className="text-text-muted text-sm mb-6">Найдите нужные запчасти в каталоге</p>
          <Link href="/parts" className="btn-primary text-sm inline-flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Перейти к запчастям
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div key={order.id} className="card-surface !p-0 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-prussian/[0.02] transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-text-dim">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">
                      {order.items.length} {(() => { const n = order.items.length % 100; const n1 = n % 10; if (n > 10 && n < 20) return "товаров"; if (n1 === 1) return "товар"; if (n1 >= 2 && n1 <= 4) return "товара"; return "товаров"; })()}
                      {" · "}
                      {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex items-center gap-3">
                    <span className="text-lg font-bold text-text">{order.totalPrice.toLocaleString("ru")} ₽</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-dim" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-dim" />
                    )}
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border">
                    {/* Items */}
                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-prussian/[0.02] border border-border">
                          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-brand-light" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">{item.partName}</p>
                            <p className="text-xs text-text-dim">
                              {item.brand} · {item.seller} · <span className="font-mono">{item.partNumber}</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-text">{(item.price * item.quantity).toLocaleString("ru")} ₽</p>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-text-dim">{item.quantity} × {item.price.toLocaleString("ru")} ₽</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery info */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-text-dim text-xs uppercase tracking-wider">Получатель</span>
                        <p className="text-text-muted mt-0.5">{order.name}</p>
                        <p className="text-text-dim text-xs">{order.phone}</p>
                      </div>
                      <div>
                        <span className="text-text-dim text-xs uppercase tracking-wider">Адрес доставки</span>
                        <p className="text-text-muted mt-0.5">{order.address}</p>
                      </div>
                    </div>

                    {order.comment && (
                      <div className="mt-3 text-xs text-text-dim italic">
                        Комментарий: {order.comment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
