/**
 * Root Layout - корневой layout для всего приложения
 * 
 * Определяет базовую структуру HTML, метаданные, шрифты (Geist Sans, Geist Mono)
 * и применяет глобальные стили для всех страниц.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cat & Parrot Ancient Karaoke",
  description: "Генерируйте древние караоке-хиты для дуэта кота и попугая с помощью AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
