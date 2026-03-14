import type { Metadata } from "next";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoEco — Умная экосистема для автомобилистов",
  description:
    "Цифровой гараж, каталог сервисов, AI-диагностика и подбор запчастей в одном месте.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-bg text-text antialiased selection:bg-brand/20">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
