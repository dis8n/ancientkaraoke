/**
 * API Route для входа пользователя
 * 
 * POST /api/auth/login
 * 
 * Принимает:
 * - email: string
 * - password: string
 * 
 * Возвращает:
 * - success: boolean
 * - error?: string
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = loginSchema.parse(body);
    
    const supabase = await createClient();
    
    // Вход через Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Ошибка при входе" },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 401 }
      );
    }

    // Создаем ответ с успешным статусом
    // Supabase SSR автоматически установит куки через createClient()
    const response = NextResponse.json({ success: true });
    
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Неверные данные. Проверьте email и пароль." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

