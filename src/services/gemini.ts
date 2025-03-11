import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Updated model name - using the latest available model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ChatSession {
  private chat;
  private history: ChatMessage[] = [];

  constructor() {
    this.chat = model.startChat({
      history: [],
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to history
      this.history.push({ role: "user", content: message });
      
      // Send message to Gemini API
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      // Add assistant response to history
      this.history.push({ role: "assistant", content: text });
      
      return text;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }
}

// Singleton instance for client-side usage
let chatSession: ChatSession | null = null;

export function getChatSession(): ChatSession {
  if (!chatSession) {
    chatSession = new ChatSession();
  }
  return chatSession;
}