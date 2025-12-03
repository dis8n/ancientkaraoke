/**
 * API Route для регистрации пользователя
 * 
 * POST /api/auth/signup
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
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = signupSchema.parse(body);
    
    const supabase = await createClient();
    
    // Регистрация через Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Ошибка при регистрации" },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Не удалось создать пользователя" },
        { status: 500 }
      );
    }

    // Создание записи пользователя в БД через Prisma
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: validatedData.email,
        },
      });
    } catch (dbError) {
      // Если пользователь уже существует в БД, это нормально
      // (может быть создан через триггер Supabase)
      console.log("User might already exist in database:", dbError);
    }

    return NextResponse.json({ success: true });
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

