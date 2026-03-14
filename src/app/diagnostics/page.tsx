"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Bot,
  Send,
  Car,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
  type?: "question" | "diagnosis";
}

interface CarItem {
  id: string;
  make: string;
  model: string;
  year: number;
}

// Predefined diagnostic scenarios
const scenarios: Record<
  string,
  { questions: string[]; diagnosis: { title: string; causes: { text: string; probability: number }[]; urgency: "high" | "medium" | "low"; recommendation: string } }
> = {
  стук: {
    questions: [
      "Уточните: стук при торможении или постоянно во время движения?",
      "Стук слышен спереди или сзади? С какой стороны?",
      "При каком пробеге вы заменяли тормозные колодки последний раз?",
    ],
    diagnosis: {
      title: "Диагноз по описанным симптомам",
      causes: [
        { text: "Износ тормозных колодок — индикатор износа касается диска", probability: 65 },
        { text: "Износ тормозного диска — выработка поверхности диска", probability: 20 },
        { text: "Попадание постороннего предмета (камня) между колодкой и диском", probability: 10 },
        { text: "Люфт суппорта тормозного механизма", probability: 5 },
      ],
      urgency: "high",
      recommendation:
        "Рекомендуем незамедлительно проверить тормозную систему. Тормоза — критически важная система безопасности. Не откладывайте визит в сервис.",
    },
  },
  масло: {
    questions: [
      "Как давно появился запах горящего масла?",
      "Вы замечали масляные пятна под машиной?",
      "Когда последний раз проверяли уровень масла?",
    ],
    diagnosis: {
      title: "Диагноз по описанным симптомам",
      causes: [
        { text: "Течь масла через прокладку клапанной крышки", probability: 45 },
        { text: "Попадание масла на горячий выпускной коллектор", probability: 30 },
        { text: "Изношенные сальники коленчатого вала", probability: 20 },
        { text: "Переполнение масла — уровень выше максимума", probability: 5 },
      ],
      urgency: "medium",
      recommendation:
        "Проверьте уровень масла щупом. Если уровень в норме — запишитесь на диагностику в течение недели. Регулярно проверяйте уровень до визита в сервис.",
    },
  },
  заводится: {
    questions: [
      "Машина совсем не заводится или заводится с трудом?",
      "Аккумулятор новый? Когда меняли?",
      "Как ведёт себя двигатель: крутит стартер, но не схватывает, или стартер не крутит?",
    ],
    diagnosis: {
      title: "Диагноз по описанным симптомам",
      causes: [
        { text: "Слабый или разряженный аккумулятор", probability: 50 },
        { text: "Неисправность стартера", probability: 20 },
        { text: "Проблемы с топливной системой (насос, форсунки)", probability: 15 },
        { text: "Неисправность системы зажигания (датчик коленвала)", probability: 15 },
      ],
      urgency: "high",
      recommendation:
        "Попробуйте завести от другого аккумулятора (прикурить). Если помогло — замените аккумулятор. Если нет — нужна полная диагностика в сервисе.",
    },
  },
  вибрация: {
    questions: [
      "Вибрация на каком скоростном диапазоне? На любой скорости или только на определённой?",
      "Вибрация при разгоне или постоянно?",
      "Когда последний раз делали балансировку колёс?",
    ],
    diagnosis: {
      title: "Диагноз по описанным симптомам",
      causes: [
        { text: "Дисбаланс колёс — нарушение балансировки", probability: 40 },
        { text: "Деформация диска (повреждение от ямы)", probability: 25 },
        { text: "Износ ступичного подшипника", probability: 20 },
        { text: "Неравномерный износ шин", probability: 15 },
      ],
      urgency: "medium",
      recommendation:
        "Рекомендуем начать с балансировки и проверки колёс у специалиста. При сильной вибрации лучше не затягивать.",
    },
  },
};

function getScenarioKey(text: string): string | null {
  if (text.includes("стук") || text.includes("скрип") || text.includes("скрежет") || text.includes("пищит")) return "стук";
  if (text.includes("масло") || text.includes("запах") || text.includes("дым")) return "масло";
  if (text.includes("не завод") || text.includes("завест") || text.includes("стартер") || text.includes("аккумулятор")) return "заводится";
  if (text.includes("вибрац") || text.includes("трясёт") || text.includes("трясет") || text.includes("дрожит")) return "вибрация";
  return null;
}

const suggestedSymptoms = [
  "Стук при торможении",
  "Запах горящего масла",
  "Не заводится утром",
  "Вибрация на скорости",
];

export default function DiagnosticsPage() {
  const { status: authStatus } = useSession();
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [scenarioKey, setScenarioKey] = useState<string | null>(null);
  const [diagnosisShown, setDiagnosisShown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/cars")
        .then((res) => res.json())
        .then((data) => {
          setCars(data);
          if (data.length > 0) setSelectedCar(data[0]);
        })
        .catch(() => {});
    }
  }, [authStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addAIMessage = async (text: string, type?: "question" | "diagnosis") => {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "ai", text, type }]);
  };

  const handleSend = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: msg }]);

    if (step === 0) {
      const key = getScenarioKey(msg.toLowerCase());
      setScenarioKey(key);

      if (!key) {
        await addAIMessage(
          `Понял, вы описываете: "${msg}". Уточните, пожалуйста: когда именно проявляется этот симптом — при движении, торможении, на холостом ходу или при запуске?`,
          "question"
        );
        setStep(1);
        return;
      }

      const scenario = scenarios[key];
      await addAIMessage(scenario.questions[0], "question");
      setStep(1);
    } else if (scenarioKey && step >= 1) {
      const scenario = scenarios[scenarioKey];
      const nextQuestion = scenario.questions[step];

      if (nextQuestion && step < 2) {
        await addAIMessage(nextQuestion, "question");
        setStep((s) => s + 1);
      } else if (!diagnosisShown) {
        setDiagnosisShown(true);
        const d = scenario.diagnosis;
        const diagText = `**${d.title}**\n\n${d.causes
          .map((c) => `• ${c.text} — вероятность ${c.probability}%`)
          .join("\n")}\n\n**Уровень срочности:** ${
          d.urgency === "high" ? "Срочно" : d.urgency === "medium" ? "В течение недели" : "Плановый ремонт"
        }\n\n**Рекомендация:** ${d.recommendation}`;
        await addAIMessage(diagText, "diagnosis");
        setStep((s) => s + 1);
      } else {
        await addAIMessage(
          "Есть ещё вопросы? Вы можете описать другой симптом или перейти к поиску подходящего сервиса.",
        );
      }
    }
  };

  const urgencyInfo = scenarioKey && diagnosisShown
    ? scenarios[scenarioKey].diagnosis.urgency
    : null;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-1">AI-диагностика</h1>
        <p className="text-text-muted">Опишите симптом — получите объяснение и рекомендацию</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Car select */}
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-brand-light" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-muted mb-1">Диагностика для</div>
                {cars.length > 0 ? (
                  <select
                    className="bg-transparent text-text font-medium text-sm focus:outline-none w-full"
                    value={selectedCar?.id || ""}
                    onChange={(e) => {
                      const car = cars.find((c) => c.id === e.target.value);
                      if (car) setSelectedCar(car);
                    }}
                  >
                    {cars.map((car) => (
                      <option key={car.id} value={car.id} className="bg-white">
                        {car.make} {car.model} {car.year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-text font-medium text-sm">
                    {authStatus === "authenticated" ? "Нет автомобилей в гараже" : "Войдите для выбора авто"}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
            </div>
          </div>

          {/* Chat messages */}
          <div className="card-surface flex-1 flex flex-col min-h-[300px] sm:min-h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {/* Initial AI greeting */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-brand-light" />
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                  <p className="text-text text-sm leading-relaxed">
                    Привет! Я AI-ассистент AutoEco.
                    <br />
                    <br />
                    Опишите симптом вашего автомобиля — что именно происходит, когда это началось. Я задам уточняющие вопросы и помогу разобраться в ситуации.
                  </p>
                </div>
              </div>

              {/* Suggested symptoms (only before first message) */}
              {messages.length === 0 && (
                <div className="pl-11">
                  <div className="text-xs text-text-muted mb-2">Частые симптомы:</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSymptoms.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="glass hover:bg-prussian/[0.06] text-text-muted hover:text-text text-sm px-3 py-1.5 rounded-xl transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-brand-light" />
                    </div>
                  )}
                  <div
                    className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand text-white rounded-tr-sm"
                        : msg.type === "diagnosis"
                        ? "glass border border-brand/20 rounded-tl-sm"
                        : "glass rounded-tl-sm text-text"
                    }`}
                  >
                    {msg.type === "diagnosis"
                      ? msg.text.split("\n").map((line, j) => (
                          <p key={j} className={`${line.startsWith("**") ? "font-semibold text-text" : "text-text-muted"} ${j > 0 ? "mt-2" : ""}`}>
                            {line.replace(/\*\*/g, "")}
                          </p>
                        ))
                      : msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-brand-light" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-light animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-light animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-light animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Find service button after diagnosis */}
              {diagnosisShown && !isTyping && (
                <div className="pl-11">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
                  >
                    <MapPin className="w-4 h-4" />
                    Найти сервис для ремонта
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 pt-4 border-t border-prussian/[0.06]">
              <input
                className="input-field flex-1"
                placeholder="Опишите симптом..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="btn-primary px-4 py-3 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Urgency indicator */}
          {urgencyInfo && (
            <div
              className={`rounded-2xl p-5 border ${
                urgencyInfo === "high"
                  ? "bg-red-500/10 border-red-500/30"
                  : urgencyInfo === "medium"
                  ? "bg-accent/10 border-accent/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {urgencyInfo === "high" ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : urgencyInfo === "medium" ? (
                  <Clock className="w-5 h-5 text-accent" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <span className="font-semibold text-text text-sm">
                  {urgencyInfo === "high"
                    ? "Требует срочного внимания"
                    : urgencyInfo === "medium"
                    ? "Нужен ремонт в течение недели"
                    : "Плановый ремонт"}
                </span>
              </div>
              <p className="text-text-muted text-sm">
                {urgencyInfo === "high"
                  ? "Не откладывайте визит в сервис. Проблема может влиять на безопасность."
                  : urgencyInfo === "medium"
                  ? "Запишитесь в удобное время в течение недели."
                  : "Запланируйте ремонт при следующем плановом ТО."}
              </p>
            </div>
          )}

          {/* How it works */}
          <div className="card-surface">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand-light" />
              <span className="font-semibold text-text">Как работает диагностика</span>
            </div>
            <div className="space-y-3 text-sm text-text-muted">
              {[
                "Опишите симптом своими словами",
                "AI задаёт уточняющие вопросы",
                "Получаете вероятные причины с %",
                "Уровень срочности и рекомендация",
                "Находите подходящий сервис",
              ].map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-light text-xs">{i + 1}</span>
                  </div>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass rounded-xl p-4 border border-prussian/[0.06]">
            <p className="text-text-dim text-xs leading-relaxed">
              AI-диагностика носит рекомендательный характер. Для точного диагноза обратитесь к квалифицированному автомеханику.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
