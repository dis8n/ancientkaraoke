"use client";

/**
 * Компонент отображения результата генерации караоке
 * 
 * Показывает:
 * - Текст песни (куплет и припев)
 * - Стиль вокала
 * - Историческую справку (lore)
 * - Уровень дружбы между котом и попугаем (score + reason)
 */
import { Music, Mic2, ScrollText, Heart } from "lucide-react";
import type { KaraokeResponse } from "../../../types/karaoke";

interface KaraokeResultProps {
  result: KaraokeResponse; // Результат генерации от AI
}

export function KaraokeResult({ result }: KaraokeResultProps) {
  return (
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
          <p className="text-sm leading-relaxed opacity-90">{result.lore}</p>
        </div>

        {/* Уровень дружбы */}
        <div
          className={`rounded-2xl p-6 shadow-lg border-2 text-white flex flex-col justify-center relative overflow-hidden ${
            result.friendship.score > 0
              ? "bg-green-600 border-green-400"
              : "bg-red-600 border-red-400"
          }`}
        >
          <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
            <Heart size={100} fill="currentColor" />
          </div>
          <h3 className="font-bold mb-1 opacity-90">Уровень Дружбы</h3>
          <div className="text-5xl font-black mb-2">
            {result.friendship.score > 0 ? "+" : ""}
            {result.friendship.score}
          </div>
          <p className="text-sm font-medium opacity-90 leading-tight">
            {result.friendship.reason}
          </p>
        </div>
      </div>
    </div>
  );
}

