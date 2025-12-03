"use client";

/**
 * Страница генерации караоке
 * 
 * Композиция компонентов:
 * - Header - шапка с навигацией и кнопкой выхода
 * - KaraokeForm - форма для ввода данных
 * - KaraokeResult - отображение результата генерации
 * 
 * Управляет состоянием формы и результата, отправляет запрос на генерацию
 */
import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { KaraokeForm, KaraokeResult } from "@/components/features/karaoke";
import type { KaraokeResponse, KaraokeFormData } from "@/types/karaoke";

export default function GeneratePage() {
  // Состояние формы с данными пользователя
  const [formData, setFormData] = useState<KaraokeFormData>({
    catName: "",
    parrotName: "",
    era: "Каменный век",
    genre: "Рок",
  });
  
  // Результат генерации от AI
  const [result, setResult] = useState<KaraokeResponse | null>(null);
  
  // Состояние загрузки (пока идет запрос к API)
  const [loading, setLoading] = useState(false);

  /**
   * Обработчик отправки формы
   * Отправляет POST запрос на /api/generate с данными формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      alert("Что-то пошло не так при вызове духов караоке.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
          <header className="text-center mb-10 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Генерация Караоке
          </h1>
          <p className="text-muted-foreground text-lg">
            Создайте уникальную песню для дуэта кота и попугая
          </p>
        </header>

        {/* Форма ввода */}
        <KaraokeForm
          formData={formData}
          loading={loading}
          hasResult={!!result}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
        />

        {/* Результат */}
        {result && <KaraokeResult result={result} />}
      </div>
    </main>
      </div>
    </div>
  );
}

