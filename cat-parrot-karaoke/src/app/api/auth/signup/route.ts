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
import { signupApiSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = signupApiSchema.parse(body);
    
    const supabase = await createClient();
    
    // Регистрация через Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return NextResponse.json(
        { error: error.message || "Ошибка при регистрации" },
        { status: 400 }
      );
    }

    if (!data.user || !data.session) {
      console.error("No user or session data returned from Supabase");
      return NextResponse.json(
        { error: "Не удалось создать пользователя" },
        { status: 500 }
      );
    }

    // Создание записи пользователя в БД через Prisma
    // Примечание: Если Prisma не может подключиться, это не критично,
    // так как пользователь уже создан в Supabase Auth.
    // Запись в таблице users может быть создана через триггер Supabase или позже.
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: validatedData.email,
        },
      });
      console.log(`✓ User created in database via Prisma: ${validatedData.email} (${data.user.id})`);
    } catch (dbError: any) {
      // Если пользователь уже существует в БД, это нормально
      if (dbError?.code === "P2002") {
        // Unique constraint violation - user already exists
        console.log(`✓ User already exists in database: ${validatedData.email}`);
      } else if (dbError?.message?.includes("Can't reach database server")) {
        // Проблема с подключением к БД - не критично, пользователь создан в Supabase Auth
        console.warn("⚠ Could not connect to database via Prisma. User is created in Supabase Auth.");
        console.warn("⚠ Consider setting up a Supabase trigger to auto-create user records.");
        console.warn("⚠ Or run sync script: npx tsx src/scripts/sync-users.ts");
      } else {
        console.error("✗ Database error while creating user:", {
          code: dbError?.code,
          message: dbError?.message,
          meta: dbError?.meta,
        });
        // Не прерываем процесс, так как пользователь уже создан в Supabase Auth
        // Но логируем детальную информацию для отладки
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Signup route error:", error);
    
    // Проверка на ZodError
    if (error?.name === "ZodError" || error?.issues) {
      const zodError = error.issues || [];
      const firstError = zodError[0];
      const errorMessage = firstError?.message || "Неверные данные. Проверьте email и пароль.";
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

