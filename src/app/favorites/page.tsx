"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/Toast";
import {
  Heart,
  HeartOff,
  Star,
  MapPin,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface ServiceCenter {
  id: string;
  name: string;
  type: string;
  typeName: string;
  rating: number;
  reviewCount: number;
  address: string;
  image: string;
  verified: boolean;
}

interface FavoriteItem {
  id: string;
  serviceCenterId: string;
  serviceCenter: ServiceCenter;
}

const serviceTypeColors: Record<string, string> = {
  sto: "bg-brand/10 text-brand border-brand/15",
  wash: "bg-sky-500/10 text-sky-600 border-sky-500/15",
  tires: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15",
  detailing: "bg-purple-500/10 text-purple-600 border-purple-500/15",
  master: "bg-accent/10 text-accent-dark border-accent/15",
  electric: "bg-yellow-500/10 text-yellow-600 border-yellow-500/15",
};

export default function FavoritesPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [status]);

  const removeFavorite = async (serviceCenterId: string) => {
    setRemoving(serviceCenterId);
    try {
      await fetch(`/api/favorites/${serviceCenterId}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.serviceCenterId !== serviceCenterId));
      toast("Удалено из избранного", "success");
    } catch {
      toast("Не удалось удалить из избранного", "error");
    } finally {
      setRemoving(null);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-1">Избранные сервисы</h1>
        <p className="text-text-muted">Сохраненные сервисные центры</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <HeartOff className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">Нет избранных сервисов</h3>
          <p className="text-text-muted text-sm mb-6">
            Добавляйте сервисы в избранное, чтобы быстро к ним возвращаться
          </p>
          <Link href="/services" className="btn-primary text-sm py-2 px-6 inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Найти сервис
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((fav) => {
            const sc = fav.serviceCenter;
            return (
              <div key={fav.id} className="card-surface hover:border-brand/30 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group h-full flex flex-col relative">
                {/* Remove button */}
                <button
                  onClick={() => removeFavorite(fav.serviceCenterId)}
                  disabled={removing === fav.serviceCenterId}
                  className="absolute top-6 right-6 z-10 p-2 rounded-xl glass hover:bg-red-500/10 transition-colors"
                  title="Удалить из избранного"
                >
                  {removing === fav.serviceCenterId ? (
                    <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
                  ) : (
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  )}
                </button>

                <Link href={`/services/${sc.id}`} className="flex flex-col h-full">
                  {/* Image */}
                  <div className="h-44 rounded-xl overflow-hidden bg-bg-elevated mb-4 relative">
                    <img
                      src={sc.image}
                      alt={sc.name}
                      className="w-full h-full object-cover"
                    />
                    {sc.verified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 glass px-2 py-1 rounded-lg text-xs text-emerald-400">
                        <Shield className="w-3 h-3" />
                        Проверен
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-text group-hover:text-prussian transition-colors line-clamp-1">
                        {sc.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-brand-light group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2 mt-0.5" />
                    </div>

                    {/* Type + rating */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`tag text-xs ${serviceTypeColors[sc.type] || ""}`}>
                        {sc.typeName}
                      </span>
                      <div className="flex items-center gap-1 text-sm ml-auto">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        <span className="font-semibold text-text">{sc.rating}</span>
                        <span className="text-text-dim">({sc.reviewCount})</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5 text-sm text-text-muted">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{sc.address}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
