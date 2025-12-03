/**
 * Типы для Supabase Database
 * 
 * Используется для типизации Supabase клиентов (Auth).
 * Для работы с таблицами БД используется Prisma (см. prisma/schema.prisma).
 * 
 * Базовый тип достаточен для работы с Supabase Auth.
 * При необходимости можно сгенерировать полные типы через:
 * npx supabase gen types typescript --project-id <project-id>
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

