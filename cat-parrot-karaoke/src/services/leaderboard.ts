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
 * Получает топ записей лидерборда, отсортированных по очкам дружбы (по убыванию)
 * 
 * @param options - Опции для получения лидерборда
 * @returns Список записей лидерборда с информацией о пользователях и генерациях
 */
export async function getLeaderboard(
  options: LeaderboardOptions = {}
): Promise<LeaderboardEntryWithUser[]> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: {
      score: "desc", // Сортировка по очкам дружбы по убыванию
    },
    take: limit,
    skip: offset,
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

  return entries as LeaderboardEntryWithUser[];
}

/**
 * Получает общее количество записей в лидерборде
 * 
 * @returns Общее количество записей
 */
export async function getLeaderboardCount(): Promise<number> {
  return prisma.leaderboardEntry.count();
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

