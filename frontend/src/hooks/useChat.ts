import { useState, useRef, useEffect } from "react";
import { FlatList } from "react-native";
import { apiClient } from "@services/api/apiClient";
import { useIsAuthenticated, useIsPremium } from "@stores/useUserStore";
import { storeData, retrieveData } from "@utils/storageUtils";

// Message interface
export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "error";
}

// Storage key for daily chat usage
const DAILY_CHAT_USAGE_KEY = "chat_daily_usage";

// Maximum messages for free users per day
export const MAX_FREE_MESSAGES_PER_DAY = 10;

// Example suggestions for new users
export const CHAT_EXAMPLES = [
  "How say 'hello' in Lithuanian?",
  "Explain basic Lithuanian grammar",
  "Show Lithuanian alphabet basics",
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! How can I help you learn Lithuanian?",
    sender: "ai",
    timestamp: new Date(),
    status: "delivered",
  },
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showExamples, setShowExamples] = useState<boolean>(true);
  const [dailyMessageCount, setDailyMessageCount] = useState<number>(0);

  const isAuthenticated = useIsAuthenticated();
  const isPremium = useIsPremium();
  const flatListRef = useRef<FlatList>(null);

  // Load and track daily message count
  useEffect(() => {
    loadDailyCount();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const loadDailyCount = async (): Promise<void> => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const storedData = await retrieveData<{ date: string; count: number }>(
        DAILY_CHAT_USAGE_KEY
      );

      if (storedData) {
        // Reset counter if it's a new day
        if (storedData.date === today) {
          setDailyMessageCount(storedData.count);
        } else {
          // New day, reset counter
          setDailyMessageCount(0);
          await storeData(DAILY_CHAT_USAGE_KEY, { date: today, count: 0 });
        }
      } else {
        // First time using chat
        await storeData(DAILY_CHAT_USAGE_KEY, { date: today, count: 0 });
      }
    } catch (error) {
      console.error("Error loading daily chat usage:", error);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendMessage = async (message: string): Promise<void> => {
    if (!isAuthenticated) return;

    // Add the user's message to the chat with "sending" status
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Hide examples after sending first message
    setShowExamples(false);
    setIsLoading(true);

    // Increment daily message count
    const newCount = dailyMessageCount + 1;
    setDailyMessageCount(newCount);

    // Save updated count to storage
    try {
      const today = new Date().toISOString().split("T")[0];
      await storeData(DAILY_CHAT_USAGE_KEY, { date: today, count: newCount });
    } catch (error) {
      console.error("Error saving daily chat usage:", error);
    }

    // Scroll to the newly added message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Update message status to "sent"
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );

      // Create context for the AI request to enforce Lithuanian content
      const context = {
        appName: "Lithuaningo",
        purpose: "language learning",
        language: "Lithuanian",
        // Important instruction to enforce Lithuanian focus
        instructions:
          "You are a Lithuanian language learning assistant named Lithuaningo AI. Only answer questions related to Lithuanian language, culture, history, or travel in Lithuania. For any questions not related to Lithuanian topics, politely explain that you can only help with Lithuanian-related topics. Always incorporate at least one Lithuanian word or fact in your responses to help the user learn. Use friendly, conversational language suitable for a language learning app.",
      };

      // Send the message to the API and get the response
      const aiResponseText = await apiClient.sendChatMessage(message, context);

      // Update message status to "delivered"
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );

      // Add the AI's response to the chat
      const aiResponse: Message = {
        id: Date.now().toString() + "_ai",
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Update message status to "error"
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "error" } : msg
        )
      );

      // Add error message
      const errorResponse: Message = {
        id: Date.now().toString() + "_error",
        text: "Sorry, I couldn't process your message. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshChat = async (): Promise<void> => {
    setRefreshing(true);
    // Simulate refreshing the chat history
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const clearInput = (): void => {
    setInputText("");
  };

  const checkDailyLimit = (): boolean => {
    return !isPremium && dailyMessageCount >= MAX_FREE_MESSAGES_PER_DAY;
  };

  return {
    // State
    messages,
    inputText,
    isLoading,
    refreshing,
    showExamples,
    dailyMessageCount,
    isAuthenticated,
    isPremium,
    flatListRef,

    // Data operations
    formatTimestamp,

    // User actions
    sendMessage,
    refreshChat,
    setInputText,
    clearInput,
    checkDailyLimit,
  };
};
