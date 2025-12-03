/**
 * Zod схемы для валидации данных авторизации
 * 
 * Используется для:
 * - Валидации форм входа, регистрации, восстановления пароля
 * - Валидации API запросов для auth
 */
import { z } from "zod";

/**
 * Схема валидации email для восстановления пароля
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

