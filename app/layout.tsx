import type { Metadata } from "next";
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
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProviders>
      </body>
    </html>);
}
