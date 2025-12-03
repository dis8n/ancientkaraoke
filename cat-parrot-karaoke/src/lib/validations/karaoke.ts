/**
 * Zod схемы для валидации данных караоке
 * 
 * Используется для:
 * - Валидации формы на клиенте (karaokeFormSchema)
 * - Валидации API запросов (karaokeRequestSchema)
 * - Валидации ответов от AI (karaokeResponseSchema)
 */
import { z } from "zod";
import { ERAS, GENRES } from "@/types/karaoke";

/**
 * Схема валидации для формы на клиенте
 * Использует string с refine для era и genre с кастомными сообщениями об ошибках
 */
export const karaokeFormSchema = z.object({
  catName: z.string().min(1, "Имя кота обязательно"),
  parrotName: z.string().min(1, "Имя попугая обязательно"),
  era: z
    .string()
    .refine((val) => ERAS.includes(val as typeof ERAS[number]), {
      message: "Выберите эпоху",
    }),
  genre: z
    .string()
    .refine((val) => GENRES.includes(val as typeof GENRES[number]), {
      message: "Выберите жанр",
    }),
});

/**
 * Схема валидации для API запроса
 * Более мягкая валидация (строки вместо enum) для гибкости API
 */
export const karaokeRequestSchema = z.object({
  catName: z.string().min(1, "Имя кота обязательно"),
  parrotName: z.string().min(1, "Имя попугая обязательно"),
  era: z.string().min(1, "Эпоха обязательна"),
  genre: z.string().min(1, "Жанр обязателен"),
});

/**
 * Схема валидации для ответа от AI
 * Гарантирует корректную структуру данных перед отправкой на фронтенд
 */
export const karaokeResponseSchema = z.object({
  song: z.object({
    verse: z.string(),
    chorus: z.string(),
  }),
  vocalStyle: z.string(),
  lore: z.string(),
  friendship: z.object({
    score: z.number().min(0).max(100), // Шкала 0-100
    reason: z.string(),
  }),
});

// TypeScript типы, выведенные из Zod схем
export type KaraokeFormInput = z.infer<typeof karaokeFormSchema>;
export type KaraokeRequestInput = z.infer<typeof karaokeRequestSchema>;
export type KaraokeResponseOutput = z.infer<typeof karaokeResponseSchema>;

