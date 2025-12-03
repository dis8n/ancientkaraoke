/**
 * Утилиты для работы с CSS классами. 
 * Объединяет CSS классы с разрешением конфликтов Tailwind (clsx + tailwind-merge)
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

