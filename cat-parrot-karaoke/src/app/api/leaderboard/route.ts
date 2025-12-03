/**
 * API Route для получения лидерборда
 * 
 * GET /api/leaderboard
 * 
 * Query параметры:
 * - limit?: number (количество записей, по умолчанию 50, максимум 100)
 * - offset?: number (смещение для пагинации, по умолчанию 0)
 * 
 * Возвращает топ пользователей по очкам дружбы, отсортированных по убыванию.
 * 
 * Не требует авторизации - лидерборд доступен всем.
 */
import { NextResponse } from "next/server";
import { getLeaderboard, getLeaderboardCount, type LeaderboardOptions } from "@/services/leaderboard";

export async function GET(request: Request) {
  try {
    // Парсинг query параметров
    const { searchParams } = new URL(request.url);

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100 // Максимум 100 записей
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Формируем опции для получения лидерборда
    const options: LeaderboardOptions = {
      limit: limit > 0 ? limit : 50,
      offset: offset >= 0 ? offset : 0,
    };

    // Получаем лидерборд и общее количество записей
    const [entries, total] = await Promise.all([
      getLeaderboard(options),
      getLeaderboardCount(),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        total,
        hasMore: options.offset + options.limit < total,
      },
    });
  } catch (error) {
    console.error("Leaderboard route error:", error);

    return NextResponse.json(
      { error: "Ошибка при получении лидерборда" },
      { status: 500 }
    );
  }
}

