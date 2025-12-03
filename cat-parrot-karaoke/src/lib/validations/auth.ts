/**
 * Zod схемы для валидации данных авторизации
 * 
 * Используется для:
 * - Валидации форм входа, регистрации, восстановления пароля
 * - Валидации API запросов для auth
 */
import { z } from "zod";

/**
 * Схема валидации для входа
 */
export const loginSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Схема валидации для регистрации (форма)
 */
export const signupSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Схема валидации для API регистрации (без confirmPassword)
 */
export const signupApiSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type SignupApiData = z.infer<typeof signupApiSchema>;

/**
 * Схема валидации email для восстановления пароля
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Схема валидации для установки нового пароля
 */
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

