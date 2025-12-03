"use client";

/**
 * Dashboard - страница истории генераций пользователя
 * 
 * Показывает список всех сгенерированных караоке пользователя с возможностью:
 * - Фильтрации по эпохе, жанру, очкам дружбы
 * - Сортировки по дате или очкам дружбы
 * - Пагинации
 */
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { GenerationList } from "@/components/features/generations/GenerationList";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Мой профиль
          </h1>
          <p className="text-muted-foreground text-lg">
            Все ваши созданные караоке-хиты
          </p>
        </header>

            <GenerationList />
        </div>
        </main>
      </div>
    </div>
  );
}

