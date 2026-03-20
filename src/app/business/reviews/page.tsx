"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Reply, Send, X, Pencil, Trash2 } from "lucide-react";

interface ReviewReply {
  id: string;
  text: string;
  createdAt: string;
}

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  carModel: string;
  reply: ReviewReply | null;
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchReviews = () => {
    fetch("/api/business/reviews")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    const method = editingReply ? "PUT" : "POST";
    const res = await fetch("/api/business/reviews/reply", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, text: replyText.trim() }),
    });
    if (res.ok) {
      setReplyingTo(null);
      setEditingReply(null);
      setReplyText("");
      fetchReviews();
    }
    setSending(false);
  };

  const handleDeleteReply = async (reviewId: string) => {
    const res = await fetch("/api/business/reviews/reply", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });
    if (res.ok) fetchReviews();
  };

  const startEdit = (review: Review) => {
    if (!review.reply) return;
    setReplyingTo(review.id);
    setEditingReply(review.id);
    setReplyText(review.reply.text);
  };

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
                    <span className="text-sm font-bold text-brand">{review.avatar || review.author[0]}</span>
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

              {/* Reply section */}
              {review.reply && replyingTo !== review.id && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-brand/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-brand">Ваш ответ</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(review)} className="p-1 rounded-lg hover:bg-prussian/[0.06] text-text-dim hover:text-text transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteReply(review.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted">{review.reply.text}</p>
                  <p className="text-[10px] text-text-dim mt-1">
                    {new Date(review.reply.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              )}

              {/* Reply form */}
              {replyingTo === review.id ? (
                <div className="mt-3 flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Напишите ответ клиенту..."
                    className="input-field text-sm flex-1 min-h-[60px] resize-none"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleReply(review.id)}
                      disabled={sending || !replyText.trim()}
                      className="p-2 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setEditingReply(null); setReplyText(""); }}
                      className="p-2 rounded-xl hover:bg-prussian/[0.06] text-text-dim transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : !review.reply ? (
                <button
                  onClick={() => { setReplyingTo(review.id); setReplyText(""); }}
                  className="mt-3 flex items-center gap-1.5 text-xs text-brand hover:text-brand-dark transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Ответить
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
