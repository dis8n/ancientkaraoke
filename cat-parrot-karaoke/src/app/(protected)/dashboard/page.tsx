/**
 * Dashboard - страница истории генераций пользователя
 * 
 * Показывает список всех сгенерированных караоке пользователя.
 * Будет реализована после интеграции БД и авторизации.
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            История Генераций
          </h1>
          <p className="text-muted-foreground text-lg">
            Все ваши созданные караоке-хиты
          </p>
        </header>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            История генераций будет доступна после интеграции базы данных и авторизации.
          </p>
        </div>
      </div>
    </main>
  );
}

