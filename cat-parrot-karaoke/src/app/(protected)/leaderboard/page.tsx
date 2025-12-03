"use client";

/**
 * Leaderboard - страница лидерборда
 * 
 * Показывает топ пользователей по очкам дружбы с возможностью пагинации.
 */
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { Leaderboard } from "@/components/features/leaderboard/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Лидерборд
              </h1>
              <p className="text-muted-foreground text-lg">
                Топ пользователей по очкам дружбы
              </p>
            </header>

            <Leaderboard />
          </div>
        </main>
      </div>
    </div>
  );
}

