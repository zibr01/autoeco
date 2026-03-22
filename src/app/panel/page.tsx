"use client";

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function AdminPanelPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm text-center animate-fade-up">
        <div className="card-surface !p-10">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-brand-light" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-extrabold mb-1">
            <span className="text-gradient-brand">AutoEco</span>{" "}
            <span className="text-text">Admin</span>
          </h1>
          <p className="text-text-muted text-sm mb-8">
            Панель управления экосистемой
          </p>

          {/* CTA */}
          <Link
            href="/panel/login"
            className="btn-primary w-full justify-center text-sm !py-3"
          >
            <span className="flex items-center gap-2">
              Войти
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-text-dim text-xs mt-6">
          &copy; 2026 AutoEco Admin
        </p>
      </div>
    </div>
  );
}
