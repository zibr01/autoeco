"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
          Что-то пошло не так
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors"
          >
            Попробовать снова
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text)] rounded-xl font-medium hover:bg-[var(--hover-bg-medium)] border border-[var(--border)] transition-colors"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}
