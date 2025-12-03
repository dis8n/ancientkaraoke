/**
 * Сервис для работы с лидербордом
 * 
 * Предоставляет функции для:
 * - Получения топ пользователей по очкам дружбы
 * - Создания записей в лидерборде
 * - Получения позиции пользователя в лидерборде
 */

import { prisma } from "../lib/prisma";

/**
 * Интерфейс записи лидерборда с информацией о пользователе и генерации
 */
export interface LeaderboardEntryWithUser {
  id: string;
  userId: string;
  generationId: string;
  score: number;
  createdAt: Date;
  user: {
    id: string;
    email: string;
  };
  generation: {
    id: string;
    promptData: any;
    resultText: string;
    friendshipScore: number;
  };
}

/**
 * Интерфейс для опций получения лидерборда
 */
export interface LeaderboardOptions {
  limit?: number; // Количество записей (по умолчанию 50)
  offset?: number; // Смещение для пагинации (по умолчанию 0)
}

/**
 * Получает топ записей лидерборда, отсортированных по сумме очков дружбы (по убыванию)
 * 
 * Показывает сумму всех очков каждого пользователя (группировка по userId).
 * Для отображения информации о дуэте используется лучшая генерация пользователя (с максимальным score).
 * 
 * @param options - Опции для получения лидерборда
 * @returns Список записей лидерборда с информацией о пользователях и генерациях
 */
export async function getLeaderboard(
  options: LeaderboardOptions = {}
): Promise<LeaderboardEntryWithUser[]> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  // Используем raw SQL для эффективной группировки по пользователю
  // Группируем по user_id, суммируем score, берем лучшую генерацию для отображения
  const rawEntries = await prisma.$queryRaw<Array<{
    user_id: string;
    total_score: number;
    best_generation_id: string;
  }>>`
    WITH user_scores AS (
      SELECT 
        user_id,
        SUM(score) as total_score,
        MAX(score) as max_score
      FROM leaderboard_entries
      GROUP BY user_id
    ),
    best_generations AS (
      SELECT DISTINCT ON (le.user_id)
        le.user_id,
        le.generation_id,
        le.score
      FROM leaderboard_entries le
      INNER JOIN user_scores us ON le.user_id = us.user_id AND le.score = us.max_score
      ORDER BY le.user_id, le.score DESC, le.created_at DESC
    )
    SELECT 
      us.user_id,
      us.total_score::int as total_score,
      bg.generation_id as best_generation_id
    FROM user_scores us
    INNER JOIN best_generations bg ON us.user_id = bg.user_id
    ORDER BY us.total_score DESC, us.user_id
    LIMIT ${limit}::int
    OFFSET ${offset}::int
  `;

  if (rawEntries.length === 0) {
    return [];
  }

  // Получаем полные данные для лучших генераций каждого пользователя
  const generationIds = rawEntries.map((e: { best_generation_id: string }) => e.best_generation_id);
  const userIds = rawEntries.map((e: { user_id: string }) => e.user_id);
  
  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      generationId: {
        in: generationIds,
      },
      userId: {
        in: userIds,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      generation: {
        select: {
          id: true,
          promptData: true,
          resultText: true,
          friendshipScore: true,
        },
      },
    },
  });

  // Создаем мапу для быстрого доступа к суммам очков
  const scoreMap = new Map<string, number>();
  rawEntries.forEach((e: { user_id: string; total_score: number }) => {
    scoreMap.set(e.user_id, e.total_score);
  });

  // Обновляем score в записях на сумму всех очков пользователя
  const entriesWithTotalScore = entries.map((entry: any) => {
    const totalScore = scoreMap.get(entry.userId) || entry.score;
    return {
      ...entry,
      score: totalScore,
    };
  });

  // Сортируем по сумме очков по убыванию
  entriesWithTotalScore.sort((a: LeaderboardEntryWithUser, b: LeaderboardEntryWithUser) => b.score - a.score);

  return entriesWithTotalScore as LeaderboardEntryWithUser[];
}

/**
 * Получает общее количество уникальных пользователей в лидерборде
 * 
 * Считает количество уникальных пользователей, а не общее количество записей,
 * так как лидерборд показывает только лучший результат каждого пользователя.
 * 
 * @returns Общее количество уникальных пользователей в лидерборде
 */
export async function getLeaderboardCount(): Promise<number> {
  // Считаем количество уникальных пользователей
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT user_id) as count
    FROM leaderboard_entries
  `;
  
  return Number(result[0]?.count || 0);
}

/**
 * Создает запись в лидерборде для генерации
 * 
 * @param userId - ID пользователя
 * @param generationId - ID генерации
 * @param score - Очки дружбы
 * @returns ID созданной записи
 * @throws Error если не удалось создать запись
 */
export async function createLeaderboardEntry(
  userId: string,
  generationId: string,
  score: number
): Promise<string> {
  try {
    // Проверяем, не существует ли уже запись для этой генерации
    const existing = await prisma.leaderboardEntry.findUnique({
      where: { generationId },
    });

    if (existing) {
      // Если запись уже существует, обновляем её (на случай, если очки изменились)
      const updated = await prisma.leaderboardEntry.update({
        where: { id: existing.id },
        data: { score },
      });
      return updated.id;
    }

    // Создаем новую запись
    const entry = await prisma.leaderboardEntry.create({
      data: {
        userId,
        generationId,
        score,
      },
    });

    return entry.id;
  } catch (error: any) {
    console.error("Error creating leaderboard entry:", error);
    throw new Error(`Не удалось создать запись в лидерборде: ${error?.message || "Неизвестная ошибка"}`);
  }
}

/**
 * Получает позицию пользователя в лидерборде по его лучшему результату
 * 
 * @param userId - ID пользователя
 * @returns Позиция пользователя (1-based) или null, если пользователь не в лидерборде
 */
export async function getUserLeaderboardPosition(userId: string): Promise<number | null> {
  // Получаем лучший результат пользователя
  const userBestEntry = await prisma.leaderboardEntry.findFirst({
    where: { userId },
    orderBy: { score: "desc" },
  });

  if (!userBestEntry) {
    return null;
  }

  // Считаем, сколько записей имеют больший или равный score
  const position = await prisma.leaderboardEntry.count({
    where: {
      score: {
        gte: userBestEntry.score,
      },
    },
  });

  return position;
}

/**
 * Получает лучший результат пользователя в лидерборде
 * 
 * @param userId - ID пользователя
 * @returns Лучшая запись пользователя или null
 */
export async function getUserBestEntry(
  userId: string
): Promise<LeaderboardEntryWithUser | null> {
  const entry = await prisma.leaderboardEntry.findFirst({
    where: { userId },
    orderBy: { score: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      generation: {
        select: {
          id: true,
          promptData: true,
          resultText: true,
          friendshipScore: true,
        },
      },
    },
  });

  return entry as LeaderboardEntryWithUser | null;
}

