"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      // Store referral code and redirect to register
      localStorage.setItem("referralCode", code);
      router.replace(`/auth/register?ref=${code}`);
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Перенаправляем...</p>
      </div>
    </div>
  );
}
