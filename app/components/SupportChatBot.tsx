"use client";
import { useState, useRef, useEffect } from "react";

/* 🕒 Time helper */
function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* 💬 Message type */
type ChatMessage = {
  from: "user" | "bot";
  text: string;
  time: string;
};

/* 🗂️ Chat session type */
type ChatSession = {
  id: string;
  createdAt: number;
  messages: ChatMessage[];
};

const STORAGE_KEY = "dreamgullak_chat_sessions";

export default function SupportChatBot() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* 🔁 Load sessions on first load */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed: ChatSession[] = JSON.parse(raw);
      setSessions(parsed);

      const last = parsed[parsed.length - 1];
      setActiveSessionId(last.id);
      setMessages(last.messages);
    } else {
      const firstSession: ChatSession = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        messages: [
          {
            from: "bot",
            text: "Hi 👋 I’m DreamGullak Support. How can I help you today?",
            time: nowTime()
          }
        ]
      };

      setSessions([firstSession]);
      setActiveSessionId(firstSession.id);
      setMessages(firstSession.messages);
    }
  }, []);

  /* 💾 Persist messages into active session */
useEffect(() => {
  if (!activeSessionId) return;

  setSessions(prevSessions => {
    const updated = prevSessions.map(s =>
      s.id === activeSessionId ? { ...s, messages } : s
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  });

  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, activeSessionId]);

  /* 🌐 Detect language */
  function detectLanguage(text: string): "en" | "hi" {
    if (/[अ-ह]/.test(text) || text.includes("kaise") || text.includes("paise")) {
      return "hi";
    }
    return "en";
  }

  async function sendMessage(text?: string) {
    const messageText = text || input;
    if (!messageText.trim()) return;

    if (messages.length === 1) {
      setLanguage(detectLanguage(messageText));
    }

    setMessages(prev => [
      ...prev,
      { from: "user", text: messageText, time: nowTime() }
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, language })
      });

      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { from: "bot", text: data.reply, time: nowTime() }
        ]);
      }, 600);
    } catch {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          from: "bot",
          text: "Something went wrong. Please try again or contact support.",
          time: nowTime()
        }
      ]);
    }
  }

  /* 🆕 New Chat = new session */
  function resetChat() {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      messages: [
        {
          from: "bot",
          text: "Hi 👋 I’m DreamGullak Support. How can I help you today?",
          time: nowTime()
        }
      ]
    };

    const updated = [...sessions, newSession];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setLanguage("en");
    setIsTyping(false);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return (
    <div className="relative max-w-md mx-auto h-[80vh] border rounded-2xl shadow-lg flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl text-white flex justify-between items-center">
        <h2 className="font-semibold text-lg">DreamGullak Support 🤖</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs underline opacity-90"
          >
            History
          </button>
          <button
            onClick={resetChat}
            className="text-xs underline opacity-90"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              m.from === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-white border text-gray-800"
            }`}
          >
            {m.text}
            <div className="text-[10px] opacity-60 mt-1 text-right">
              {m.time}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mr-auto bg-white border rounded-2xl px-4 py-2 text-sm text-gray-500">
            DreamGullak is typing…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t bg-white flex gap-2 overflow-x-auto">
        {["💼Account issues", "❌Payment failed", "🧾KYC help", "🧑Talk to agent"].map(
          q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1 rounded-full bg-gray-100"
            >
              {q}
            </button>
          )
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question…"
          className="flex-1 border rounded-full px-4 py-2 text-sm"
        />
        <button
          onClick={() => sendMessage()}
          className="bg-blue-600 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>

      {/* 🕘 History Modal */}
      {showHistory && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-80 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-sm">Chat History</h3>
              <button onClick={() => setShowHistory(false)}>✕</button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map(s => (
                <button
                  key={s.id}
                   onClick={() => {
                     setActiveSessionId(s.id);
                     setMessages([...s.messages]); // important
                     setShowHistory(false);
                 }}

                  className="w-full text-left text-sm p-2 rounded hover:bg-gray-100"
                >
                  {new Date(s.createdAt).toLocaleDateString()} •{" "}
                  {new Date(s.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

