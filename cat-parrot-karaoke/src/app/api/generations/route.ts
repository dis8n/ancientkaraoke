/**
 * API Route для получения истории генераций пользователя
 * 
 * GET /api/generations
 * 
 * Query параметры:
 * - page?: number (номер страницы, по умолчанию 1)
 * - limit?: number (количество записей на странице, по умолчанию 20)
 * - sortField?: "createdAt" | "friendshipScore" (поле для сортировки)
 * - sortOrder?: "asc" | "desc" (направление сортировки)
 * - era?: string (фильтр по эпохе)
 * - genre?: string (фильтр по жанру)
 * - minScore?: number (минимальные очки дружбы)
 * - maxScore?: number (максимальные очки дружбы)
 * 
 * Возвращает пагинированный список генераций пользователя
 * 
 * Требует авторизации
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserGenerations,
  type GenerationFilters,
  type SortOptions,
  type PaginationOptions,
} from "@/services/generation";

export async function GET(request: Request) {
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

    // Парсинг query параметров
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortField = searchParams.get("sortField") as "createdAt" | "friendshipScore" | null;
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;
    const era = searchParams.get("era") || undefined;
    const genre = searchParams.get("genre") || undefined;
    const minScore = searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!, 10) : undefined;
    const maxScore = searchParams.get("maxScore") ? parseInt(searchParams.get("maxScore")!, 10) : undefined;

    // Формируем фильтры
    const filters: GenerationFilters = {
      userId: user.id,
      era,
      genre,
      minFriendshipScore: minScore,
      maxFriendshipScore: maxScore,
    };

    // Формируем опции сортировки
    const sort: SortOptions | undefined = sortField && sortOrder
      ? {
          field: sortField,
          order: sortOrder,
        }
      : undefined;

    // Формируем опции пагинации
    const pagination: PaginationOptions = {
      page: page > 0 ? page : 1,
      limit: limit > 0 && limit <= 100 ? limit : 20, // Ограничиваем максимум 100 записей
    };

    // Получаем генерации через сервис
    const result = await getUserGenerations(filters, sort, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generations route error:", error);

    return NextResponse.json(
      { error: "Ошибка при получении генераций" },
      { status: 500 }
    );
  }
}

