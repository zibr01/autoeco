"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/Toast";
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

const suggestedSymptoms = [
  "Стук при торможении",
  "Запах горящего масла",
  "Не заводится утром",
  "Вибрация на скорости",
  "Перегревается двигатель",
  "Горит Check Engine",
  "Стук в подвеске на кочках",
  "Рывки при переключении передач",
  "Увеличился расход топлива",
  "Тяжело крутить руль",
];

export default function DiagnosticsPage() {
  const { toast } = useToast();
  const { status: authStatus } = useSession();
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [urgency, setUrgency] = useState<"high" | "medium" | "low" | null>(null);
  const [diagnosisShown, setDiagnosisShown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/cars")
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setCars(list);
          if (list.length > 0) setSelectedCar(list[0]);
        })
        .catch(() => { toast("Не удалось загрузить список автомобилей", "error"); });
    }
  }, [authStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || isTyping) return;
    setInput("");

    const userMsg: Message = { role: "user", text: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: newMessages,
          carId: selectedCar?.id,
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      const aiMsg: Message = { role: "ai", text: data.reply, type: data.type };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.type === "diagnosis") {
        setDiagnosisShown(true);
        if (data.urgency) setUrgency(data.urgency);
      }
    } catch {
      setIsTyping(false);
      toast("AI-диагностика временно недоступна", "error");
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Произошла ошибка. Попробуйте ещё раз.", type: "question" },
      ]);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setUrgency(null);
    setDiagnosisShown(false);
  };

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
                    <br /><br />
                    Опишите симптом вашего автомобиля — я задам уточняющие вопросы и помогу определить возможные причины.
                    <br /><br />
                    Я знаю 10 основных категорий неисправностей: тормоза, двигатель, подвеска, электрика, КПП, охлаждение, рулевое и другие.
                  </p>
                </div>
              </div>

              {/* Suggested symptoms */}
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
                    {msg.text.split("\n").map((line, j) => {
                      if (!line.trim()) return <br key={j} />;
                      const isBold = line.startsWith("**") || line.includes("**");
                      const clean = line.replace(/\*\*/g, "");
                      const isList = clean.startsWith("- ");
                      return (
                        <p
                          key={j}
                          className={`${isBold ? "font-semibold text-text" : msg.role === "user" ? "" : "text-text-muted"} ${j > 0 && !isList ? "mt-1" : ""} ${isList ? "ml-1" : ""}`}
                        >
                          {clean}
                        </p>
                      );
                    })}
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

              {/* Action buttons after diagnosis */}
              {diagnosisShown && !isTyping && (
                <div className="pl-11 flex flex-wrap gap-2">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
                  >
                    <MapPin className="w-4 h-4" />
                    Найти сервис для ремонта
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="btn-secondary text-sm py-2.5 px-5"
                  >
                    Новая диагностика
                  </button>
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
          {urgency && (
            <div
              className={`rounded-2xl p-5 border ${
                urgency === "high"
                  ? "bg-red-500/10 border-red-500/30"
                  : urgency === "medium"
                  ? "bg-accent/10 border-accent/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {urgency === "high" ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : urgency === "medium" ? (
                  <Clock className="w-5 h-5 text-accent" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <span className="font-semibold text-text text-sm">
                  {urgency === "high"
                    ? "Требует срочного внимания"
                    : urgency === "medium"
                    ? "Нужен ремонт в течение недели"
                    : "Плановый ремонт"}
                </span>
              </div>
              <p className="text-text-muted text-sm">
                {urgency === "high"
                  ? "Не откладывайте визит в сервис. Проблема может влиять на безопасность."
                  : urgency === "medium"
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
                "Анализ по базе из 10 категорий",
                "Вероятные причины с процентами",
                "Уровень срочности и рекомендация",
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

          {/* Categories */}
          <div className="card-surface">
            <span className="font-semibold text-text text-sm mb-3 block">Категории диагностики</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Тормоза", "Двигатель", "Подвеска", "Электрика",
                "КПП", "Охлаждение", "Рулевое", "Топливо",
                "Колёса", "Запуск",
              ].map((cat) => (
                <span key={cat} className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass rounded-xl p-4 border border-prussian/[0.06]">
            <p className="text-text-dim text-xs leading-relaxed">
              AI-диагностика носит рекомендательный характер и основана на базе типичных неисправностей. Для точного диагноза обратитесь к квалифицированному автомеханику.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
