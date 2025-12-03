import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Landing Page - главная страница приложения
 * 
 * Минималистичный дизайн с кнопками для входа и регистрации.
 * Следует принципам Clean Aesthetic: монохромная палитра, без градиентов и эмодзи.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        {/* Заголовок */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            Cat & Parrot
          </h1>
          <h2 className="text-xl md:text-2xl font-light text-muted-foreground">
            Ancient Karaoke
          </h2>
        </header>

        {/* Описание */}
        <div className="text-center space-y-2 max-w-md mx-auto">
          <p className="text-muted-foreground text-lg">
            Генерируйте древние караоке-хиты для дуэта кота и попугая с помощью AI.
          </p>
          <p className="text-muted-foreground text-sm">
            Выберите эпоху, жанр, имена персонажей — получите уникальную песню с историческим лором и уровнем дружбы.
          </p>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" variant="default" className="w-full sm:w-auto min-w-[200px]">
            <Link href="/login">Войти</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px]">
            <Link href="/signup">Регистрация</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
