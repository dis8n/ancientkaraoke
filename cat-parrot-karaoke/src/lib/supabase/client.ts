/**
 * Supabase Client для браузера
 * 
 * Используется в клиентских компонентах (use client).
 * Создает новый экземпляр клиента для каждого запроса.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

