export interface KaraokeResponse {
  song: {
    verse: string;
    chorus: string;
  };
  vocalStyle: string;
  lore: string;
  friendship: {
    score: number;
    reason: string;
  };
}

export interface KaraokeFormData {
  catName: string;
  parrotName: string;
  era: string;
  genre: string;
}

export const ERAS = [
  "Каменный век",
  "Древний Египет",
  "Шумеры",
  "Майя",
  "Ацтеки",
  "Средневековье",
] as const;

export const GENRES = [
  "Поп",
  "Рок",
  "Баллада",
  "Регги",
  "Рэп",
  "Опера",
] as const;

export type Era = (typeof ERAS)[number];
export type Genre = (typeof GENRES)[number];

