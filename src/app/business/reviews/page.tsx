"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  carModel: string;
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  avgRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export default function BusinessReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/reviews")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-text-muted py-20">Не удалось загрузить отзывы</div>;
  }

  const maxCount = Math.max(...(data.ratingDistribution.map((r) => r.count) || [1]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Отзывы</h1>
        <p className="text-sm text-text-muted mt-1">Обратная связь от клиентов</p>
      </div>

      {/* Rating Summary */}
      <div className="card-surface !p-5">
        <div className="flex items-start gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-text">{data.avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-0.5 justify-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(data.avgRating) ? "text-amber-400 fill-current" : "text-text-dim"}`}
                />
              ))}
            </div>
            <p className="text-xs text-text-dim mt-1">{data.total} отзывов</p>
          </div>

          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const item = data.ratingDistribution.find((r) => r.rating === star);
              const count = item?.count || 0;
              const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-3 text-right">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <div className="flex-1 h-2 rounded-full bg-prussian/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-dim w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {data.reviews.length === 0 ? (
        <div className="card-surface text-center py-12">
          <MessageSquare className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted">Отзывов пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.reviews.map((review) => (
            <div key={review.id} className="card-surface !p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand">{review.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{review.author}</p>
                    <p className="text-[10px] text-text-dim">{review.carModel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? "text-amber-400 fill-current" : "text-text-dim"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-text-dim mt-0.5">
                    {new Date(review.date).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
