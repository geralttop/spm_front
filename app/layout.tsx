import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { LayoutWrapper } from "@/src/widgets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPM - SharePlacesMaps",
  description: "Персонализированное освоение пространства и обмен локальным опытом",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Язык будет обновляться динамически через LanguageProvider
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? ""}&lang=ru_RU`}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
