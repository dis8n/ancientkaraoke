"use client";

/**
 * Главная страница приложения
 * 
 * Композиция компонентов:
 * - KaraokeForm - форма для ввода данных
 * - KaraokeResult - отображение результата генерации
 * 
 * Управляет состоянием формы и результата, отправляет запрос на генерацию
 */
import { useState } from "react";
import { KaraokeForm, KaraokeResult } from "@/components/features/karaoke";
import type { KaraokeResponse, KaraokeFormData } from "@/types/karaoke";

export default function Home() {
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* Заголовок */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 mb-2">
            Cat & Parrot
          </h1>
          <h2 className="text-xl md:text-2xl font-light opacity-90">
            Ancient Karaoke 🎤
          </h2>
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
  );
}
