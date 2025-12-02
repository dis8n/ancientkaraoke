/**
 * Типы и константы для модуля караоке
 * 
 * Определяет структуру данных для:
 * - Ответа от AI (KaraokeResponse)
 * - Данных формы (KaraokeFormData)
 * - Доступных эпох и жанров
 */

/**
 * Структура ответа от AI после генерации караоке
 */
export interface KaraokeResponse {
  song: {
    verse: string; // Куплет (4 строки с рифмовкой AABB)
    chorus: string; // Припев (4 строки с рифмовкой AABB)
  };
  vocalStyle: string; // Описание стиля вокала (1-2 предложения)
  lore: string; // Псевдо-историческая справка о песне в выбранной эпохе
  friendship: {
    score: number; // Уровень дружбы (-50 до +50)
    reason: string; // Объяснение уровня дружбы
  };
}

/**
 * Данные формы для генерации караоке
 */
export interface KaraokeFormData {
  catName: string; // Имя кота
  parrotName: string; // Имя попугая
  era: string; // Выбранная эпоха
  genre: string; // Выбранный жанр
}

/**
 * Доступные эпохи для генерации караоке
 */
export const ERAS = [
  "Каменный век",
  "Древний Египет",
  "Шумеры",
  "Майя",
  "Ацтеки",
  "Средневековье",
] as const;

/**
 * Доступные жанры для генерации караоке
 */
export const GENRES = [
  "Поп",
  "Рок",
  "Баллада",
  "Регги",
  "Рэп",
  "Опера",
] as const;

// Типы на основе констант
export type Era = (typeof ERAS)[number];
export type Genre = (typeof GENRES)[number];

