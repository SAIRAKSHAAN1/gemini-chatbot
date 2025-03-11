"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { ChatMessage, getChatSession } from "../services/gemini";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = getChatSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput("");
    setIsLoading(true);
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    try {
      // Get response from Gemini
      const response = await chatSession.sendMessage(userMessage);
      
      // Add assistant response
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: "Sorry, I couldn't process your request. Please try again." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 shadow">
        <h1 className="text-xl font-bold">Gemini Chatbot</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>👋 Welcome! How can I help you today?</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-100 ml-auto"
                    : "bg-white border border-gray-200"
                } max-w-[80%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div className="font-medium mb-1">
                  {message.role === "user" ? "You" : "Gemini"}
                </div>
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="animate-bounce h-2 w-2 bg-blue-600 rounded-full"></div>
              <div className="animate-bounce h-2 w-2 bg-blue-600 rounded-full" style={{ animationDelay: "0.2s" }}></div>
              <div className="animate-bounce h-2 w-2 bg-blue-600 rounded-full" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}