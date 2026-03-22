"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[var(--hover-bg)] ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-surface space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <Skeleton className="h-3 w-1/2 mx-auto" />
      <Skeleton className="h-8 w-16 mx-auto" />
      <Skeleton className="h-3 w-2/3 mx-auto" />
    </div>
  );
}
