"use client";

/**
 * Страница установки нового пароля
 * 
 * Позволяет пользователю установить новый пароль после перехода по ссылке из email.
 * Минималистичный дизайн без градиентов и эмодзи.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Проверяем наличие токена в URL при загрузке страницы
  useEffect(() => {
    const supabase = createClient();
    
    // Supabase передает токен через hash в URL (например, #access_token=...&type=recovery)
    // Слушаем изменения состояния авторизации для обработки hash токена
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setIsValidToken(true);
      }
    });

    // Проверяем текущую сессию
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsValidToken(true);
      } else {
        // Проверяем hash в URL
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          // Ждем обработки hash токена через onAuthStateChange
          // Если через 3 секунды сессия не появилась, считаем токен невалидным
          setTimeout(async () => {
            const {
              data: { session: delayedSession },
            } = await supabase.auth.getSession();
            if (!delayedSession) {
              setIsValidToken(false);
            }
          }, 3000);
        } else {
          setIsValidToken(false);
        }
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Обновление пароля через Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        setError(updateError.message || "Ошибка при обновлении пароля. Попробуйте позже.");
        return;
      }

      // Успешно обновлен пароль - редирект на страницу входа
      router.push("/login?password-reset=success");
    } catch (error) {
      console.error("Password reset request error:", error);
      setError("Что-то пошло не так. Проверьте подключение к интернету и попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Показываем загрузку пока проверяем токен
  if (isValidToken === null) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <p className="text-muted-foreground">Проверка ссылки...</p>
        </div>
      </main>
    );
  }

  // Если токен невалиден или отсутствует
  if (isValidToken === false) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Недействительная ссылка
            </h1>
            <p className="text-muted-foreground">
              Ссылка для восстановления пароля недействительна или истекла. 
              Пожалуйста, запросите новую ссылку.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild variant="default" className="w-full">
              <Link href="/forgot-password">Запросить новую ссылку</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Вернуться к входу</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Форма для установки нового пароля
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Заголовок */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Установить новый пароль
          </h1>
          <p className="text-muted-foreground">
            Введите новый пароль для вашего аккаунта
          </p>
        </header>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Новый пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Минимум 6 символов
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Обновление..." : "Обновить пароль"}
          </Button>
        </form>

        {/* Ссылки */}
        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Вспомнили пароль? Войти
          </Link>
        </div>
      </div>
    </main>
  );
}

