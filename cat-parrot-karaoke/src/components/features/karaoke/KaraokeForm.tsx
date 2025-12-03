"use client";

/**
 * Компонент формы для генерации караоке
 * 
 * Отображает форму с полями:
 * - Имя кота
 * - Имя попугая
 * - Выбор эпохи (Каменный век, Древний Египет и т.д.)
 * - Выбор жанра (Поп, Рок, Баллада и т.д.)
 * 
 * При отправке формы вызывает onSubmit с данными формы
 */
import { ERAS, GENRES, type KaraokeFormData } from "../../../types/karaoke";

interface KaraokeFormProps {
  formData: KaraokeFormData; // Текущие данные формы
  loading: boolean; // Состояние загрузки (показывает "Призываем музу...")
  hasResult: boolean; // Есть ли уже сгенерированный результат
  onFormDataChange: (data: KaraokeFormData) => void; // Callback при изменении полей
  onSubmit: (e: React.FormEvent) => void; // Callback при отправке формы
}

export function KaraokeForm({
  formData,
  loading,
  hasResult,
  onFormDataChange,
  onSubmit,
}: KaraokeFormProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 ml-1">Имя Кота 🐱</label>
            <input
              required
              type="text"
              placeholder="Барсик"
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              value={formData.catName}
              onChange={(e) =>
                onFormDataChange({ ...formData, catName: e.target.value })
              }
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
              onChange={(e) =>
                onFormDataChange({ ...formData, parrotName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 ml-1">Древняя Эпоха 🗿</label>
            <select
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white [&>option]:text-black"
              value={formData.era}
              onChange={(e) =>
                onFormDataChange({ ...formData, era: e.target.value })
              }
            >
              {ERAS.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 ml-1">Жанр Песни 🎸</label>
            <select
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-white [&>option]:text-black"
              value={formData.genre}
              onChange={(e) =>
                onFormDataChange({ ...formData, genre: e.target.value })
              }
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
        >
          {loading
            ? "Призываем музу..."
            : hasResult
            ? "Перегенерировать Шедевр"
            : "Сгенерировать Хит"}
        </button>
      </form>
    </div>
  );
}

