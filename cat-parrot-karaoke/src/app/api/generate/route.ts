/**
 * API Route для генерации караоке
 * 
 * POST /api/generate
 * 
 * Принимает JSON с полями:
 * - catName: string
 * - parrotName: string
 * - era: string
 * - genre: string
 * 
 * Возвращает сгенерированное караоке или ошибку
 * 
 * Требует авторизации - сохраняет генерацию в БД с привязкой к userId
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { karaokeRequestSchema } from "../../../lib/validations/karaoke";
import { generateKaraoke, saveGenerationToDatabase } from "../../../services/karaoke";
import { createLeaderboardEntry } from "../../../services/leaderboard";

/**
 * Обработчик POST запроса для генерации караоке
 */
export async function POST(req: Request) {
  try {
    // Проверка авторизации пользователя
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Валидация запроса через Zod - проверяем корректность входных данных
    const validationResult = karaokeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Неверные данные запроса", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { catName, parrotName, era, genre } = validationResult.data;

    // Генерация караоке через сервис (вызов OpenAI API)
    const data = await generateKaraoke({
      catName,
      parrotName,
      era,
      genre,
    });

    // Сохранение генерации в БД через сервис
    // Обрабатываем ошибки БД, но не прерываем процесс - генерация уже выполнена
    let generationId: string | null = null;
    try {
      generationId = await saveGenerationToDatabase(
        user.id,
        { catName, parrotName, era, genre },
        data
      );
      console.log(`✓ Generation saved to database for user ${user.id}`);

      // Создание записи в лидерборде
      if (generationId) {
        try {
          await createLeaderboardEntry(
            user.id,
            generationId,
            data.friendship.score
          );
          console.log(`✓ Leaderboard entry created for generation ${generationId}`);
        } catch (leaderboardError: any) {
          // Логируем ошибку лидерборда, но не прерываем процесс
          console.error("Error creating leaderboard entry:", leaderboardError);
          // Генерация уже сохранена, это не критично
        }
      }
    } catch (dbError: any) {
      // Логируем ошибку БД, но не прерываем процесс - генерация уже выполнена
      console.error("Database error while saving generation:", dbError);
      // Можно продолжить выполнение, так как генерация уже успешна
      // Или вернуть ошибку, если сохранение критично
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate route error:", error);
    
    // Проверка на специфичные ошибки
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return NextResponse.json(
          { error: "Ошибка конфигурации: отсутствует API ключ OpenAI" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Ошибка генерации караоке" },
      { status: 500 }
    );
  }
}
