"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Send,
  ChevronLeft,
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
  sender: { id: true; name: string | null; role: string };
}

export default function BusinessMessagesPage() {
  const { data: session } = useSession();
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
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      pollRef.current = setInterval(() => fetchMessages(activeChat), 5000);
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
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const currentUserId = session?.user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Сообщения</h1>
        <p className="text-text-muted text-sm mt-1">Переписка с клиентами</p>
      </div>

      <div className="card-surface !p-0 overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        <div className="flex h-full">
          {/* Conversations list */}
          <div className={`${activeChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-border`}>
            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 text-text-dim mx-auto mb-3" />
                  <p className="text-text-muted text-sm">Нет сообщений</p>
                  <p className="text-text-dim text-xs mt-1">Клиенты смогут написать вам со страницы сервиса</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => {
                      setActiveChat(conv.partnerId);
                      setActiveName(conv.partnerName);
                      setMessages([]);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-prussian/[0.03] transition-colors border-b border-border/50 ${
                      activeChat === conv.partnerId ? "bg-brand/5" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-sm">
                        {conv.partnerName.charAt(0).toUpperCase()}
                      </span>
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

          {/* Chat */}
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-1 rounded-lg hover:bg-prussian/[0.04]">
                  <ChevronLeft className="w-5 h-5 text-text-muted" />
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-medium text-text text-sm">{activeName}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-text-dim text-sm">Начните переписку</div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 ${
                          isMine ? "bg-brand text-white rounded-br-sm" : "glass border border-border rounded-bl-sm text-text"
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

              <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <input
                    className="input-field flex-1 text-sm"
                    placeholder="Ответить клиенту..."
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
                <p className="text-text-muted">Выберите переписку</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 86400000) return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return date.toLocaleDateString("ru-RU", { weekday: "short" });
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
