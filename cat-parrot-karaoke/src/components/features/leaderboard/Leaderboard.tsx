"use client";

/**
 * Компонент для отображения лидерборда
 * 
 * Отображает топ пользователей по очкам дружбы с возможностью пагинации.
 * Минималистичный дизайн без градиентов и эмодзи.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, ChevronLeft, ChevronRight } from "lucide-react";
import type { LeaderboardEntryWithUser } from "@/services/leaderboard";

interface LeaderboardProps {
  initialData?: {
    entries: LeaderboardEntryWithUser[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export function Leaderboard({ initialData }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntryWithUser[]>(
    initialData?.entries || []
  );
  const [pagination, setPagination] = useState(
    initialData?.pagination || {
      limit: 50,
      offset: 0,
      total: 0,
      hasMore: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка лидерборда
  const fetchLeaderboard = async (offset: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: offset.toString(),
      });

      const response = await fetch(`/api/leaderboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Ошибка при загрузке лидерборда");
      }

      const data = await response.json();
      setEntries(data.entries);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании компонента
  useEffect(() => {
    if (!initialData) {
      fetchLeaderboard(0);
    }
  }, []);

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

  // Получение иконки для позиции
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-600" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  // Получение цвета для позиции
  const getPositionColor = (position: number) => {
    if (position === 1) return "text-yellow-600";
    if (position === 2) return "text-gray-400";
    if (position === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      )}

      {!loading && !error && entries.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Лидерборд пока пуст. Создайте первую генерацию на странице{" "}
            <a href="/generate" className="text-foreground underline">
              Генерация
            </a>
            !
          </CardContent>
        </Card>
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Топ пользователей по очкам дружбы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {entries.map((entry, index) => {
                  const position = pagination.offset + index + 1;
                  const promptData = getPromptData(entry.generation.promptData);
                  const Icon = getPositionIcon(position);

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      {/* Позиция */}
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getPositionColor(
                          position
                        )}`}
                      >
                        {Icon || position}
                      </div>

                      {/* Информация о пользователе и генерации */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground truncate">
                            {entry.user.email}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {promptData.catName} & {promptData.parrotName}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {promptData.era} • {promptData.genre}
                        </div>
                      </div>

                      {/* Очки дружбы */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {entry.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          очков дружбы
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Пагинация */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Показано {pagination.offset + 1} -{" "}
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{" "}
                из {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLeaderboard(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLeaderboard(pagination.offset + pagination.limit)}
                  disabled={!pagination.hasMore || loading}
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

