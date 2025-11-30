// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { catName, parrotName, era, genre } = body;

    if (!catName || !parrotName || !era || !genre) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const prompt = `
      Ты — креативный сценарист и композитор песен для караоке-игры "Cat & Parrot Ancient Karaoke".
      
      Вводные данные:
      - Кот: ${catName}
      - Попугай: ${parrotName}
      - Эпоха: ${era}
      - Жанр песни: ${genre}

      Задача: Сгенерируй ответ в формате JSON (без Markdown форматирования) со следующими полями:
      1. "song": Текст песни (Куплет + Припев). Тематика должна сочетать выбранную эпоху и бытовые проблемы кота/попугая.
      2. "vocalStyle": Смешное описание того, как звучит песня (например, "Кот орет как шаман, попугай добавляет автотюн").
      3. "lore": Историческая справка. Как эта песня могла существовать в этой эпохе? (Псевдо-исторический юмор).
      4. "friendship": Объект с полями:
         - "score": Число (уровень дружбы, может быть отрицательным или положительным).
         - "reason": Почему такой уровень (смешная причина, основанная на выступлении).

      Ответ должен быть строго валидным JSON. Язык: Русский.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo', // для экономии
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error("Пустой ответ от AI");
    }

    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Ошибка генерации караоке' }, { status: 500 });
  }
}