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
      Ты — древний бард и мастер караоке, который сочиняет веселые рифмованные песни для дуэта кота и попугая в разных исторических эпохах.
      
      Вводные данные:
      - Кот: ${catName}
      - Попугай: ${parrotName}
      - Эпоха: ${era}
      - Жанр песни: ${genre}

      Задача: Сгенерируй ответ в формате JSON (без Markdown форматирования) со следующими полями:
      1. "song": ОДНО четверостишие (ровно 4 строки) с ОБЯЗАТЕЛЬНОЙ рифмой по схеме AABB:
         - Строка 1 рифмуется со строкой 2 (например: "кот" - "живот")
         - Строка 3 рифмуется со строкой 4 (например: "попугай" - "край")
         - Тематика: выбранная эпоха + имена кота и попугая + веселый юмор
         - Текст должен быть простым, запоминающимся, подходящим для караоке
         - Пример правильной рифмы: "В ${era} жил ${catName} умный, 
         С ${parrotName} дружил он шумный, 
         Вместе пели они песню, 
         О дружбе своей чудесной!"
      2. "vocalStyle": Смешное описание того, как звучит песня (например, "Кот орет как шаман, попугай добавляет автотюн").
      3. "lore": Историческая справка. Как эта песня могла существовать в этой эпохе? (Псевдо-исторический юмор).
      4. "friendship": Объект с полями:
         - "score": Число (уровень дружбы, может быть отрицательным или положительным).
         - "reason": Почему такой уровень (смешная причина, основанная на выступлении).

      КРИТИЧЕСКИ ВАЖНО: 
      - Текст песни - ровно 4 строки (четверостишие)
      - Схема рифмовки СТРОГО AABB (1-2 строки рифмуются, 3-4 строки рифмуются)
      - Рифма должна быть четкой и слышимой (не приблизительной!)
      - Проверь каждую строку на рифму перед отправкой ответа 
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