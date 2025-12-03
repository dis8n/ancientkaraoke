"use client";

/**
 * Header компонент для защищенных страниц
 * 
 * Отображает навигацию и кнопку выхода.
 * Минималистичный дизайн без градиентов и эмодзи.
 */
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const result = await res.json();
        alert(result.error || "Ошибка при выходе");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Что-то пошло не так при выходе");
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">
              Cat & Parrot Karaoke
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-sm"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

