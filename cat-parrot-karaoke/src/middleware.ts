/**
 * Middleware для защиты роутов
 * 
 * Проверяет авторизацию пользователя через Supabase Auth.
 * Защищает роуты: /generate, /dashboard, /history, /profile
 * Редиректит неавторизованных пользователей на /login
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Создаем Supabase клиент для middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Проверяем авторизацию через getUser() - это проверяет валидность токена на сервере Supabase
  // getSession() может вернуть старую сессию из кук, даже если она недействительна
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Публичные роуты (доступны без авторизации)
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Защищенные роуты (требуют авторизации)
  const protectedRoutes = ["/generate", "/dashboard", "/history", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Если есть ошибка авторизации или пользователь не найден, считаем его неавторизованным
  const isAuthenticated = user && !authError;

  // Если пользователь не авторизован и пытается зайти на защищенный роут
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь авторизован и пытается зайти на страницы входа/регистрации
  if (isAuthenticated && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/generate", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (API routes handle their own auth)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

