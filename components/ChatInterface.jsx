"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I've analyzed your local ward reports. It seems there is a scheduled maintenance for water pipelines in your area tomorrow between 10:00 AM and 2:00 PM. Would you like me to set a reminder or help you file a different civic request?",
      timestamp: new Date(new Date().setHours(10, 24)),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: "user",
      text: userMessageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageText }),
      });

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: data.reply || "Thanks. AI integration will be connected soon.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: "Sorry, I am having trouble connecting to the service. Please try again later.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-3xl flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-unit-lg mx-auto" style={{ height: '70vh' }}>
      
      {/* System/Welcome State */}
      <div className="flex flex-col items-center text-center space-y-unit-md mb-unit-xl mt-unit-md">
        <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-background">Namaste, I'm Nagrik Mitra</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Your AI-powered civic assistant. How can I help you navigate municipal services or infrastructure queries today?
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-margin-mobile md:px-2 flex flex-col gap-unit-lg pb-32">
        {messages.map((msg) => {
          const isAssistant = msg.sender === "assistant";
          return (
            <div key={msg.id} className={`flex flex-col gap-unit-xs group ${isAssistant ? "items-start" : "items-end"}`}>
              <div className={`flex items-center gap-unit-sm mb-1 ${isAssistant ? "ml-unit-sm" : "mr-unit-sm"}`}>
                {!isAssistant && <span className="font-label-sm text-label-sm text-on-surface-variant/40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                <span className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-wider">
                  {isAssistant ? "Assistant" : "You"}
                </span>
                {isAssistant && <span className="font-label-sm text-label-sm text-on-surface-variant/40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              </div>
              <div
                className={`px-unit-lg py-unit-md rounded-2xl max-w-[85%] message-shadow transition-all duration-300 group-hover:scale-[1.005] ${
                  isAssistant
                    ? msg.isError
                      ? "bg-error-container text-on-error-container rounded-tl-none border border-error-container"
                      : "bg-surface-container-low text-on-surface rounded-tl-none"
                    : "bg-primary-container text-white rounded-tr-none"
                }`}
              >
                <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 ml-unit-sm">
            <div className="flex space-x-1 bg-surface-container-low p-4 rounded-2xl rounded-tl-none">
              <div className="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-unit-md pt-4 px-margin-mobile bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent">
        <form onSubmit={handleSend} className="w-full bg-surface-container-lowest floating-input-shadow rounded-full p-2 flex items-center gap-2 border border-outline-variant/30 ring-1 ring-black/[0.02]">
          <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder:text-on-surface-variant/50 px-2 h-12 outline-none"
            placeholder="Ask Nagrik Mitra anything..."
          />
          
          <div className="flex items-center gap-1 pr-1">
            <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors relative group">
              <span className="material-symbols-outlined">mic</span>
              <span className="absolute inset-0 bg-primary/5 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
            </button>
            <button type="submit" disabled={!input.trim() || isLoading} className="h-12 px-6 flex items-center justify-center rounded-full bg-on-background disabled:opacity-50 text-white hover:bg-primary transition-all duration-300 font-label-md gap-2">
              <span>Send</span>
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
