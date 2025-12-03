"use client";

/**
 * Страница восстановления пароля
 * 
 * Позволяет пользователю ввести email для получения ссылки на восстановление пароля.
 * Минималистичный дизайн без градиентов и эмодзи.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      // TODO: Интеграция с Supabase Auth для отправки email восстановления
      // await supabase.auth.resetPasswordForEmail(data.email)
      
      // Имитация запроса
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      alert("Ошибка при отправке запроса. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Проверьте почту
            </h1>
            <p className="text-muted-foreground">
              Мы отправили ссылку для восстановления пароля на указанный email адрес.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Вернуться к входу</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Заголовок */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Восстановление пароля
          </h1>
          <p className="text-muted-foreground">
            Введите email адрес, и мы отправим вам ссылку для восстановления пароля
          </p>
        </header>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Отправка..." : "Отправить ссылку"}
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

