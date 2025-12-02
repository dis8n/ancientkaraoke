import { z } from "zod";
import { ERAS, GENRES } from "@/types/karaoke";

export const karaokeFormSchema = z.object({
  catName: z.string().min(1, "Имя кота обязательно"),
  parrotName: z.string().min(1, "Имя попугая обязательно"),
  era: z.enum(ERAS as [string, ...string[]], {
    errorMap: () => ({ message: "Выберите эпоху" }),
  }),
  genre: z.enum(GENRES as [string, ...string[]], {
    errorMap: () => ({ message: "Выберите жанр" }),
  }),
});

export const karaokeRequestSchema = z.object({
  catName: z.string().min(1, "Имя кота обязательно"),
  parrotName: z.string().min(1, "Имя попугая обязательно"),
  era: z.string().min(1, "Эпоха обязательна"),
  genre: z.string().min(1, "Жанр обязателен"),
});

export const karaokeResponseSchema = z.object({
  song: z.object({
    verse: z.string(),
    chorus: z.string(),
  }),
  vocalStyle: z.string(),
  lore: z.string(),
  friendship: z.object({
    score: z.number(),
    reason: z.string(),
  }),
});

export type KaraokeFormInput = z.infer<typeof karaokeFormSchema>;
export type KaraokeRequestInput = z.infer<typeof karaokeRequestSchema>;
export type KaraokeResponseOutput = z.infer<typeof karaokeResponseSchema>;

