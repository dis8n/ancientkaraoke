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
 */
import { NextResponse } from "next/server";
import { karaokeRequestSchema } from "../../../lib/validations/karaoke";
import { generateKaraoke } from "../../../services/karaoke";

/**
 * Обработчик POST запроса для генерации караоке
 */
export async function POST(req: Request) {
  try {
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Ошибка генерации караоке" },
      { status: 500 }
    );
  }
}
