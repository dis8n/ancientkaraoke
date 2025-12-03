/**
 * Типы для Supabase Database
 * 
 * Пока используется базовый тип. После настройки Supabase
 * можно сгенерировать типы через: npx supabase gen types typescript --project-id <project-id>
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

