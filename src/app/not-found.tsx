import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-brand/20 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
          Страница не найдена
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          Возможно, она была перемещена или вы перешли по неверной ссылке.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors"
          >
            На главную
          </Link>
          <Link
            href="/services"
            className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text)] rounded-xl font-medium hover:bg-[var(--hover-bg-medium)] border border-[var(--border)] transition-colors"
          >
            Каталог сервисов
          </Link>
        </div>
      </div>
    </div>
  );
}
