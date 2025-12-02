/**
 * Сервис генерации караоке через OpenAI API
 * 
 * Основная бизнес-логика:
 * 1. Генерирует промпт на основе входных данных
 * 2. Отправляет запрос в OpenAI
 * 3. Парсит JSON ответ
 * 4. Валидирует ответ через Zod схему
 * 5. Возвращает валидированные данные
 */
import OpenAI from "openai";
import { generateKaraokePrompt } from "../prompts/karaoke";
import { karaokeResponseSchema } from "../lib/validations/karaoke";
import type { KaraokeResponse } from "../types/karaoke";

/**
 * Получает или создает OpenAI клиент
 * Ленивая инициализация для избежания ошибок при отсутствии API ключа
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY не установлен. Пожалуйста, добавьте OPENAI_API_KEY в .env.local"
    );
  }

  return new OpenAI({
    apiKey,
  });
}

export interface GenerateKaraokeInput {
  catName: string; // Имя кота
  parrotName: string; // Имя попугая
  era: string; // Эпоха (Каменный век, Древний Египет и т.д.)
  genre: string; // Жанр песни (Поп, Рок, Баллада и т.д.)
}

/**
 * Генерирует караоке через OpenAI API
 * 
 * @param data - Входные данные для генерации
 * @returns Валидированный ответ от AI с текстом песни, лором и уровнем дружбы
 * @throws Error если ответ от AI пустой или невалидный
 */
export async function generateKaraoke(
  data: GenerateKaraokeInput
): Promise<KaraokeResponse> {
  // Генерируем промпт на основе входных данных
  const prompt = generateKaraokePrompt(
    data.catName,
    data.parrotName,
    data.era,
    data.genre
  );

  // Получаем OpenAI клиент (ленивая инициализация)
  const openai = getOpenAIClient();

  // Отправляем запрос в OpenAI
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4.1",
    response_format: { type: "json_object" }, // Требуем JSON формат ответа
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("Пустой ответ от AI");
  }

  // Парсим JSON ответ
  const parsedData = JSON.parse(content);

  // Валидация ответа через Zod - гарантирует корректную структуру данных
  const validatedData = karaokeResponseSchema.parse(parsedData);

  return validatedData;
}

