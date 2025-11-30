// app/page.tsx
"use client";

import { useState } from "react";
import { Music, Mic2, ScrollText, Heart, RotateCcw } from "lucide-react";

// Типы данных ответа
interface KaraokeResponse {
  song: {
    verse: string;
    chorus: string;
  };
  vocalStyle: string;
  lore: string;
  friendship: {
    score: number;
    reason: string;
  };
}

export default function Home() {
  const [formData, setFormData] = useState({
    catName: "",
    parrotName: "",
    era: "Каменный век",
    genre: "Рок",
  });
  const [result, setResult] = useState<KaraokeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const eras = ["Каменный век", "Древний Египет", "Шумеры", "Майя", "Ацтеки", "Средневековье"];
  const genres = ["Поп", "Рок", "Баллада", "Регги", "Рэп", "Опера"];

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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 ml-1">Имя Кота 🐱</label>
                <input
                  required
                  type="text"
                  placeholder="Барсик"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  value={formData.catName}
                  onChange={(e) => setFormData({ ...formData, catName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 ml-1">Имя Попугая 🦜</label>
                <input
                  required
                  type="text"
                  placeholder="Кеша"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                  value={formData.parrotName}
                  onChange={(e) => setFormData({ ...formData, parrotName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 ml-1">Древняя Эпоха 🗿</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white [&>option]:text-black"
                  value={formData.era}
                  onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                >
                  {eras.map((era) => <option key={era} value={era}>{era}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 ml-1">Жанр Песни 🎸</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-white [&>option]:text-black"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                >
                  {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
            >
              {loading ? "Призываем музу..." : (result ? "Перегенерировать Шедевр" : "Сгенерировать Хит")}
            </button>
          </form>
        </div>

        {/* Результат */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
            
            {/* Песня */}
            <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Music size={100} />
              </div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mic2 className="text-pink-600" /> Текст Песни
              </h3>
              <div className="space-y-4 text-lg font-medium leading-relaxed font-mono whitespace-pre-line">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Куплет
                  </div>
                  <div>{result.song.verse}</div>
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Припев
                  </div>
                  <div>{result.song.chorus}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 italic flex items-start gap-2">
                <span>🔊</span> 
                <p>{result.vocalStyle}</p>
              </div>
            </div>

            {/* Лор и Дружба */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Лор */}
              <div className="bg-yellow-100 text-yellow-900 rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <ScrollText className="w-5 h-5" /> Историческая Справка
                </h3>
                <p className="text-sm leading-relaxed opacity-90">
                  {result.lore}
                </p>
              </div>

              {/* Уровень дружбы */}
              <div className={`rounded-2xl p-6 shadow-lg border-2 text-white flex flex-col justify-center relative overflow-hidden ${
                result.friendship.score > 0 ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'
              }`}>
                <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                   <Heart size={100} fill="currentColor" />
                </div>
                <h3 className="font-bold mb-1 opacity-90">Уровень Дружбы</h3>
                <div className="text-5xl font-black mb-2">
                  {result.friendship.score > 0 ? "+" : ""}{result.friendship.score}
                </div>
                <p className="text-sm font-medium opacity-90 leading-tight">
                  {result.friendship.reason}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}