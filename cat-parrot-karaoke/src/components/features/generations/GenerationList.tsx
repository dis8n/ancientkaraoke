"use client";

/**
 * Компонент для отображения списка генераций караоке
 * 
 * Отображает генерации пользователя в виде карточек с возможностью:
 * - Фильтрации по эпохе, жанру, очкам дружбы
 * - Сортировки по дате или очкам дружбы
 * - Пагинации
 * 
 * Минималистичный дизайн без градиентов и эмодзи.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Heart, Music, ChevronLeft, ChevronRight } from "lucide-react";
import type { GenerationWithUser } from "@/services/generation";
import { ERAS, GENRES } from "@/types/karaoke";
import { cn } from "@/lib/utils";

interface GenerationListProps {
  initialData?: {
    data: GenerationWithUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export function GenerationList({ initialData }: GenerationListProps) {
  const [generations, setGenerations] = useState<GenerationWithUser[]>(initialData?.data || []);
  const [pagination, setPagination] = useState(initialData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Фильтры и сортировка
  const [filters, setFilters] = useState({
    era: "",
    genre: "",
    minScore: "",
    maxScore: "",
  });
  const [sort, setSort] = useState<{
    field: "createdAt" | "friendshipScore";
    order: "asc" | "desc";
  }>({
    field: "createdAt",
    order: "desc",
  });

  // Загрузка генераций
  const fetchGenerations = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortField: sort.field,
        sortOrder: sort.order,
      });

      if (filters.era) params.append("era", filters.era);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.minScore) params.append("minScore", filters.minScore);
      if (filters.maxScore) params.append("maxScore", filters.maxScore);

      const response = await fetch(`/api/generations?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Ошибка при загрузке генераций");
      }

      const data = await response.json();
      setGenerations(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      console.error("Error fetching generations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при изменении фильтров или сортировки
  useEffect(() => {
    fetchGenerations(1);
  }, [sort.field, sort.order, filters.era, filters.genre, filters.minScore, filters.maxScore]);

  // Форматирование даты
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  // Получение данных из promptData
  const getPromptData = (promptData: any) => {
    if (typeof promptData === "object" && promptData !== null) {
      return {
        catName: promptData.catName || "Неизвестно",
        parrotName: promptData.parrotName || "Неизвестно",
        era: promptData.era || "Неизвестно",
        genre: promptData.genre || "Неизвестно",
      };
    }
    return {
      catName: "Неизвестно",
      parrotName: "Неизвестно",
      era: "Неизвестно",
      genre: "Неизвестно",
    };
  };

  return (
    <div className="space-y-6">
      {/* Фильтры и сортировка */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и сортировка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Фильтр по эпохе */}
            <div className="space-y-2">
              <Label htmlFor="era">Эпоха</Label>
              <select
                id="era"
                value={filters.era}
                onChange={(e) => setFilters({ ...filters, era: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Все эпохи</option>
                {ERAS.map((era) => (
                  <option key={era} value={era}>
                    {era}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по жанру */}
            <div className="space-y-2">
              <Label htmlFor="genre">Жанр</Label>
              <select
                id="genre"
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Все жанры</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по минимальным очкам */}
            <div className="space-y-2">
              <Label htmlFor="minScore">Мин. очки</Label>
              <Input
                id="minScore"
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Фильтр по максимальным очкам */}
            <div className="space-y-2">
              <Label htmlFor="maxScore">Макс. очки</Label>
              <Input
                id="maxScore"
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          {/* Сортировка */}
          <div className="flex items-center gap-4">
            <Label>Сортировка:</Label>
            <select
              value={sort.field}
              onChange={(e) =>
                setSort({ ...sort, field: e.target.value as "createdAt" | "friendshipScore" })
              }
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="createdAt">По дате</option>
              <option value="friendshipScore">По очкам дружбы</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSort({ ...sort, order: sort.order === "asc" ? "desc" : "asc" })}
            >
              {sort.order === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список генераций */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      )}

      {!loading && !error && generations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            У вас пока нет генераций. Создайте первую на странице{" "}
            <a href="/generate" className="text-foreground underline">
              Генерация
            </a>
            !
          </CardContent>
        </Card>
      )}

      {!loading && !error && generations.length > 0 && (
        <>
          <div className="grid gap-4">
            {generations.map((generation) => {
              const promptData = getPromptData(generation.promptData);
              return (
                <Card key={generation.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {promptData.catName} & {promptData.parrotName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {promptData.era} • {promptData.genre}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{generation.friendshipScore}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {generation.resultText}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(generation.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Пагинация */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Показано {((pagination.page - 1) * pagination.limit) + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} из{" "}
                {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchGenerations(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </Button>
                <span className="text-sm text-muted-foreground">
                  Страница {pagination.page} из {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchGenerations(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  Вперед
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

