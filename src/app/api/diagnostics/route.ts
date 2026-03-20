import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Ты — AI-диагност автомобилей в приложении AutoEco. Твоя задача — помочь автовладельцу определить возможные причины неисправности по описанию симптомов.

Правила поведения:
1. Отвечай ТОЛЬКО на русском языке
2. Будь дружелюбным, профессиональным и понятным для обычного автовладельца
3. Избегай слишком технического жаргона — объясняй простыми словами
4. Всегда задавай 2-3 уточняющих вопроса перед постановкой диагноза
5. После получения ответов на вопросы — дай развёрнутый диагноз

Формат диагноза (когда достаточно информации):
Ответь строго в JSON формате:
{
  "type": "diagnosis",
  "reply": "текст диагноза в markdown",
  "urgency": "high" | "medium" | "low",
  "category": "название категории"
}

Текст диагноза должен содержать:
- **Диагноз: [Категория]** — заголовок
- Список возможных причин с вероятностями в процентах (от наиболее вероятной к наименее)
- **Срочность:** — уровень срочности с пояснением
- **Рекомендация:** — конкретный совет что делать

Формат уточняющего вопроса:
{
  "type": "question",
  "reply": "текст вопроса"
}

Категории неисправностей: Тормозная система, Система смазки двигателя, Система запуска, Ходовая часть / Колёса, Подвеска, Система охлаждения, Электрооборудование, Трансмиссия, Топливная система, Рулевое управление, Выхлопная система, Кузов и салон.

Уровни срочности:
- high: угроза безопасности, возможно дальнейшее повреждение (тормоза, перегрев, рулевое, критические утечки)
- medium: нужен ремонт в ближайшие дни/неделю (стуки, вибрации, повышенный расход)
- low: плановое обслуживание (незначительные звуки, косметические дефекты)

ВАЖНО:
- Не ставь диагноз после первого сообщения — сначала задай уточняющие вопросы
- Если описание слишком общее, попроси уточнить
- Всегда предупреждай, что AI-диагностика носит рекомендательный характер
- Если симптомы указывают на опасную ситуацию (тормоза, перегрев), сразу предупреди об этом`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { message, history, carId } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Сообщение обязательно" }, { status: 400 });
  }

  // Get car info for context
  let carContext = "";
  if (carId) {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { make: true, model: true, year: true, mileage: true, engine: true, transmission: true, fuelType: true },
    });
    if (car) {
      carContext = `\n\nАвтомобиль клиента: ${car.make} ${car.model} ${car.year}, пробег ${car.mileage.toLocaleString()} км, двигатель ${car.engine}, КПП ${car.transmission}, топливо ${car.fuelType}.`;
    }
  }

  // Build conversation messages for Claude
  const claudeMessages: { role: "user" | "assistant"; content: string }[] = [];

  // Add conversation history
  if (history && Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role === "user") {
        claudeMessages.push({ role: "user", content: msg.text });
      } else if (msg.role === "ai") {
        claudeMessages.push({ role: "assistant", content: msg.text });
      }
    }
  }

  // Add current message
  claudeMessages.push({ role: "user", content: message });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT + carContext,
      messages: claudeMessages,
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";

    // Try to parse JSON response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          reply: parsed.reply || rawText,
          type: parsed.type || "question",
          urgency: parsed.urgency,
          category: parsed.category,
        });
      } catch {
        // JSON parse failed, treat as plain text question
      }
    }

    // Fallback: return as question
    return NextResponse.json({
      reply: rawText,
      type: "question",
    });
  } catch (error) {
    console.error("Claude API error:", error);

    // Fallback to keyword-based diagnostics if API fails
    return fallbackDiagnostics(message, history);
  }
}

// ─── Fallback keyword-based system ───────────────────

interface SymptomDef {
  keywords: string[];
  questions: string[];
  causes: { text: string; probability: number }[];
  urgency: "high" | "medium" | "low";
  recommendation: string;
  category: string;
}

const symptoms: SymptomDef[] = [
  {
    keywords: ["стук", "скрип", "скрежет", "пищит", "тормоз"],
    category: "Тормозная система",
    questions: ["Стук/скрип при торможении или постоянно?", "Звук спереди или сзади?", "Когда меняли колодки?"],
    causes: [
      { text: "Износ тормозных колодок", probability: 55 },
      { text: "Деформация тормозного диска", probability: 20 },
      { text: "Попадание грязи между колодкой и диском", probability: 12 },
      { text: "Люфт суппорта", probability: 8 },
      { text: "Коррозия диска после стоянки", probability: 5 },
    ],
    urgency: "high",
    recommendation: "Тормоза — критическая система. Рекомендуем проверку в ближайшие 1-2 дня.",
  },
  {
    keywords: ["масло", "запах гар", "дым из-под капота", "течь масла"],
    category: "Система смазки двигателя",
    questions: ["Как давно заметили?", "Есть масляные пятна под машиной?", "Когда меняли масло?"],
    causes: [
      { text: "Течь через прокладку клапанной крышки", probability: 35 },
      { text: "Масло на горячем коллекторе", probability: 25 },
      { text: "Износ маслосъёмных колпачков", probability: 20 },
      { text: "Износ сальников", probability: 12 },
      { text: "Перелив масла", probability: 8 },
    ],
    urgency: "medium",
    recommendation: "Проверьте уровень масла. Если ниже минимума — долейте. Запишитесь на диагностику.",
  },
  {
    keywords: ["не завод", "завест", "стартер", "не крутит", "не схватывает"],
    category: "Система запуска",
    questions: ["Стартер крутит?", "Когда меняли аккумулятор?", "На холодную или горячую?"],
    causes: [
      { text: "Разряжен аккумулятор", probability: 40 },
      { text: "Неисправность стартера", probability: 18 },
      { text: "Проблемы с топливной системой", probability: 17 },
      { text: "Неисправность датчика коленвала", probability: 15 },
      { text: "Окислены клеммы", probability: 10 },
    ],
    urgency: "high",
    recommendation: "Попробуйте прикурить. Если помогло — замените аккумулятор.",
  },
  {
    keywords: ["вибрац", "трясёт", "трясет", "бьёт руль", "бьет руль"],
    category: "Ходовая часть / Колёса",
    questions: ["На какой скорости?", "При разгоне или торможении?", "Когда делали балансировку?"],
    causes: [
      { text: "Нарушена балансировка колёс", probability: 35 },
      { text: "Деформация диска", probability: 22 },
      { text: "Износ ступичного подшипника", probability: 18 },
      { text: "Неравномерный износ шин", probability: 15 },
      { text: "Износ ШРУСа", probability: 10 },
    ],
    urgency: "medium",
    recommendation: "Начните с балансировки и осмотра колёс.",
  },
  {
    keywords: ["перегрев", "кипит", "температур", "антифриз", "радиатор", "закипел"],
    category: "Система охлаждения",
    questions: ["Стрелка в красной зоне?", "Есть следы подтекания?", "Когда меняли антифриз?"],
    causes: [
      { text: "Неисправность термостата", probability: 30 },
      { text: "Утечка антифриза", probability: 25 },
      { text: "Неисправность вентилятора", probability: 20 },
      { text: "Забит радиатор", probability: 15 },
      { text: "Неисправность помпы", probability: 10 },
    ],
    urgency: "high",
    recommendation: "НЕМЕДЛЕННО заглушите двигатель! Перегрев может серьёзно повредить мотор.",
  },
];

function findSymptom(text: string): SymptomDef | null {
  const lower = text.toLowerCase();
  let best: SymptomDef | null = null;
  let bestScore = 0;
  for (const s of symptoms) {
    let score = 0;
    for (const kw of s.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

function fallbackDiagnostics(message: string, history: { role: string; text: string; type?: string }[] | undefined) {
  const questionCount = (history || []).filter((m) => m.role === "ai" && m.type === "question").length;
  const fullText = message + " " + (history || []).map((m) => m.text).join(" ");
  const symptom = findSymptom(fullText);

  if (questionCount === 0) {
    if (!symptom) {
      return NextResponse.json({
        reply: `Понял, вы описываете: "${message}". Уточните подробнее — посторонние звуки, вибрация, проблемы с запуском, индикаторы на панели?`,
        type: "question",
      });
    }
    return NextResponse.json({
      reply: `Похоже на проблему в категории **${symptom.category}**.\n\n${symptom.questions[0]}`,
      type: "question",
    });
  }

  if (symptom && questionCount < symptom.questions.length) {
    return NextResponse.json({ reply: symptom.questions[questionCount], type: "question" });
  }

  if (symptom) {
    const diagLines = [
      `**Диагноз: ${symptom.category}**`,
      "",
      ...symptom.causes.map((c) => `- ${c.text} — **${c.probability}%**`),
      "",
      `**Срочность:** ${symptom.urgency === "high" ? "Высокая" : symptom.urgency === "medium" ? "Средняя" : "Низкая"}`,
      "",
      `**Рекомендация:** ${symptom.recommendation}`,
    ];
    return NextResponse.json({ reply: diagLines.join("\n"), type: "diagnosis", urgency: symptom.urgency });
  }

  return NextResponse.json({
    reply: "Не удалось определить проблему. Попробуйте описать симптом подробнее.",
    type: "question",
  });
}
