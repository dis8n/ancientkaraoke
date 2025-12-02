import OpenAI from "openai";
import { generateKaraokePrompt } from "../prompts/karaoke";
import { karaokeResponseSchema } from "../lib/validations/karaoke";
import type { KaraokeResponse } from "../types/karaoke";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateKaraokeInput {
  catName: string;
  parrotName: string;
  era: string;
  genre: string;
}

export async function generateKaraoke(
  data: GenerateKaraokeInput
): Promise<KaraokeResponse> {
  const prompt = generateKaraokePrompt(
    data.catName,
    data.parrotName,
    data.era,
    data.genre
  );

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4.1",
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("Пустой ответ от AI");
  }

  const parsedData = JSON.parse(content);

  // Валидация ответа через Zod
  const validatedData = karaokeResponseSchema.parse(parsedData);

  return validatedData;
}

