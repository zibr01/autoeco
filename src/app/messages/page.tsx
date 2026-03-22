"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  MessageSquare,
  Send,
  ChevronLeft,
  Building2,
  User,
  Loader2,
  CheckCheck,
} from "lucide-react";

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string | null; role: string };
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    }>
      <MessagesPage />
    </Suspense>
  );
}

function MessagesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetchConversations();

      // Check for ?with= parameter (open specific chat)
      const withUser = searchParams.get("with");
      const withName = searchParams.get("name");
      if (withUser) {
        setActiveChat(withUser);
        setActiveName(withName || "");
      }
    }
  }, [authStatus, router, searchParams]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      // Poll for new messages every 15 seconds
      pollRef.current = setInterval(() => fetchMessages(activeChat), 15000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  const fetchMessages = (partnerId: string) => {
    fetch(`/api/messages?with=${partnerId}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []));
  };

  const handleSend = async () => {
    if (!input.trim() || !activeChat || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeChat, text }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        fetchConversations(); // Update sidebar
      }
    } finally {
      setSending(false);
    }
  };

  const openChat = (partnerId: string, name: string) => {
    setActiveChat(partnerId);
    setActiveName(name);
    setMessages([]);
  };

  if (loading || authStatus === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const currentUserId = session?.user?.id;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Сообщения</h1>
        <p className="text-text-muted text-sm mt-1">Переписка с сервисными центрами</p>
      </div>

      <div className="card-surface !p-0 overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`${activeChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-border`}>
            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 text-text-dim mx-auto mb-3" />
                  <p className="text-text-muted text-sm">Нет сообщений</p>
                  <p className="text-text-dim text-xs mt-1">Напишите сервису со страницы записи</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => openChat(conv.partnerId, conv.partnerName)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-prussian/[0.03] transition-colors border-b border-border/50 ${
                      activeChat === conv.partnerId ? "bg-brand/5" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      {conv.partnerRole === "BUSINESS" ? (
                        <Building2 className="w-4.5 h-4.5 text-brand" />
                      ) : (
                        <User className="w-4.5 h-4.5 text-brand" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text truncate">{conv.partnerName}</span>
                        <span className="text-[10px] text-text-dim flex-shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-card/50">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-prussian/[0.04] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-text-muted" />
                </button>
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-brand" />
                </div>
                <span className="font-medium text-text text-sm">{activeName}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-text-dim text-sm">
                    Начните переписку
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-brand text-white rounded-br-sm"
                            : "glass border border-border rounded-bl-sm text-text"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? "text-white/50" : "text-text-dim"}`}>
                          <span className="text-[10px]">
                            {new Date(msg.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMine && msg.read && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <input
                    className="input-field flex-1 text-sm"
                    placeholder="Напишите сообщение..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="btn-primary px-4 py-2.5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-text-dim mx-auto mb-3" />
                <p className="text-text-muted">Выберите чат из списка</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 86400000) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 604800000) {
    return date.toLocaleDateString("ru-RU", { weekday: "short" });
  }
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
