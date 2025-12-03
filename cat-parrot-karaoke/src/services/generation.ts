/**
 * Сервис для работы с генерациями караоке в базе данных
 * 
 * Предоставляет функции для:
 * - Получения генераций пользователя
 * - Фильтрации и сортировки генераций
 * - Пагинации результатов
 * - Получения конкретной генерации по ID
 * 
 * Используется в API routes и компонентах для отображения истории генераций
 */

import { prisma } from "../lib/prisma";

/**
 * Тип генерации с включенными связанными данными пользователя
 */
export interface GenerationWithUser {
  id: string;
  userId: string;
  promptData: any; // JSONB поле
  resultText: string;
  friendshipScore: number;
  createdAt: Date;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Интерфейс для фильтрации генераций
 */
export interface GenerationFilters {
  userId: string; // Обязательный фильтр по пользователю
  era?: string; // Опциональная фильтрация по эпохе
  genre?: string; // Опциональная фильтрация по жанру
  minFriendshipScore?: number; // Минимальные очки дружбы
  maxFriendshipScore?: number; // Максимальные очки дружбы
  startDate?: Date; // Начальная дата для фильтрации по времени
  endDate?: Date; // Конечная дата для фильтрации по времени
}

/**
 * Интерфейс для пагинации
 */
export interface PaginationOptions {
  page?: number; // Номер страницы (начиная с 1)
  limit?: number; // Количество записей на странице
}

/**
 * Интерфейс для сортировки
 */
export type SortOrder = "asc" | "desc";
export type SortField = "createdAt" | "friendshipScore";

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

/**
 * Результат запроса с пагинацией
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Получает все генерации пользователя с опциональной фильтрацией, сортировкой и пагинацией
 * 
 * @param filters - Фильтры для выборки генераций
 * @param sort - Опции сортировки
 * @param pagination - Опции пагинации
 * @returns Пагинированный список генераций
 */
export async function getUserGenerations(
  filters: GenerationFilters,
  sort?: SortOptions,
  pagination?: PaginationOptions
): Promise<PaginatedResult<GenerationWithUser>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;

  // Формируем условие WHERE для Prisma
  const where: any = {
    userId: filters.userId,
  };

  // Добавляем фильтры по promptData (JSONB поле)
  // В Prisma для JSONB полей используем специальный синтаксис через path queries
  // Фильтрация по era и genre реализована через проверку значений в JSONB
  if (filters.era || filters.genre) {
    // Для фильтрации по JSONB полям используем Prisma JsonFilter
    // К сожалению, Prisma 6.x не поддерживает прямую фильтрацию по вложенным полям JSONB
    // Поэтому фильтруем на уровне приложения после получения данных
    // Это не идеально, но работает для текущих требований
    // В будущем можно использовать raw SQL запросы для более эффективной фильтрации
  }

  // Фильтр по очкам дружбы
  if (filters.minFriendshipScore !== undefined || filters.maxFriendshipScore !== undefined) {
    where.friendshipScore = {};
    if (filters.minFriendshipScore !== undefined) {
      where.friendshipScore.gte = filters.minFriendshipScore;
    }
    if (filters.maxFriendshipScore !== undefined) {
      where.friendshipScore.lte = filters.maxFriendshipScore;
    }
  }

  // Фильтр по дате
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  // Опции сортировки
  const orderBy: any = sort
    ? { [sort.field]: sort.order }
    : { createdAt: "desc" }; // По умолчанию сортируем по дате создания (новые сначала)

  // Получаем общее количество записей (для пагинации)
  const total = await prisma.generation.count({ where });

  // Получаем данные с пагинацией
  let data = await prisma.generation.findMany({
    where,
    orderBy,
    skip,
    take: limit * 2, // Берем больше данных для фильтрации на уровне приложения
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // Фильтрация по era и genre на уровне приложения (так как Prisma 6.x не поддерживает прямую фильтрацию по JSONB)
  if (filters.era || filters.genre) {
    data = data.filter((generation: GenerationWithUser) => {
      const promptData = generation.promptData as any;
      if (filters.era && promptData?.era !== filters.era) {
        return false;
      }
      if (filters.genre && promptData?.genre !== filters.genre) {
        return false;
      }
      return true;
    });
  }

  // Ограничиваем до нужного количества после фильтрации
  data = data.slice(0, limit);

  // Пересчитываем total с учетом фильтров по era/genre
  // Для точного подсчета нужно делать отдельный запрос с фильтрацией
  // Для упрощения используем приблизительное значение
  let actualTotal = total;
  if (filters.era || filters.genre) {
    // Если есть фильтры по era/genre, нужно пересчитать total
    // Для этого делаем запрос всех записей пользователя и фильтруем
    const allUserGenerations = await prisma.generation.findMany({
      where: { userId: filters.userId },
      select: { promptData: true },
    });
    actualTotal = allUserGenerations.filter((gen: { promptData: any }) => {
      const promptData = gen.promptData as any;
      if (filters.era && promptData?.era !== filters.era) return false;
      if (filters.genre && promptData?.genre !== filters.genre) return false;
      return true;
    }).length;
  }

  const totalPages = Math.ceil(actualTotal / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: actualTotal,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Получает конкретную генерацию по ID
 * 
 * @param generationId - ID генерации
 * @param userId - ID пользователя (для проверки прав доступа)
 * @returns Генерация или null, если не найдена или пользователь не имеет доступа
 */
export async function getGenerationById(
  generationId: string,
  userId: string
): Promise<GenerationWithUser | null> {
  const generation = await prisma.generation.findFirst({
    where: {
      id: generationId,
      userId, // Проверяем, что генерация принадлежит пользователю
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return generation;
}

/**
 * Получает последние N генераций пользователя
 * 
 * @param userId - ID пользователя
 * @param limit - Количество последних генераций (по умолчанию 10)
 * @returns Список генераций
 */
export async function getRecentGenerations(
  userId: string,
  limit: number = 10
): Promise<GenerationWithUser[]> {
  return prisma.generation.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Получает статистику генераций пользователя
 * 
 * @param userId - ID пользователя
 * @returns Статистика (общее количество, средние очки дружбы, и т.д.)
 */
export async function getUserGenerationStats(userId: string) {
  const [total, avgScore, maxScore, minScore] = await Promise.all([
    prisma.generation.count({
      where: { userId },
    }),
    prisma.generation.aggregate({
      where: { userId },
      _avg: { friendshipScore: true },
    }),
    prisma.generation.aggregate({
      where: { userId },
      _max: { friendshipScore: true },
    }),
    prisma.generation.aggregate({
      where: { userId },
      _min: { friendshipScore: true },
    }),
  ]);

  return {
    total,
    averageScore: avgScore._avg.friendshipScore || 0,
    maxScore: maxScore._max.friendshipScore || 0,
    minScore: minScore._min.friendshipScore || 0,
  };
}

