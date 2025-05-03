import { useState, useRef, useEffect } from "react";
import { FlatList } from "react-native";
import { useTheme } from "react-native-paper";
import { router } from "expo-router";
import { apiClient } from "@services/api/apiClient";
import {
  useIsAuthenticated,
  useIsPremium,
  useUserData,
} from "@stores/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAlertDialog from "@hooks/useAlertDialog";

// Message interface
export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "error";
}

// Session ID storage key
const SESSION_ID_KEY = "lithuaningo:chat:session_id";

// Maximum messages for free users per day
export const MAX_FREE_MESSAGES_PER_DAY = 5;

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
  // Core chat state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showExamples, setShowExamples] = useState<boolean>(true);
  const [dailyMessageCount, setDailyMessageCount] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // External hooks
  const isAuthenticated = useIsAuthenticated();
  const isPremium = useIsPremium();
  const userData = useUserData();
  const alertDialog = useAlertDialog();
  const theme = useTheme();

  // UI refs
  const flatListRef = useRef<FlatList>(null);

  // ===== Core Chat Logic =====

  // Load and track daily message count
  useEffect(() => {
    if (isAuthenticated && userData?.id) {
      loadChatStats();
    }
  }, [isAuthenticated, userData?.id]);

  // Initialize session ID on component mount
  useEffect(() => {
    initSessionId();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Load chat stats from the server
  const loadChatStats = async (): Promise<void> => {
    if (!isAuthenticated || !userData?.id) return;

    try {
      const stats = await apiClient.getUserChatStats(userData.id);
      setDailyMessageCount(stats.todayMessageCount);
    } catch (error) {
      console.error("Error loading chat stats:", error);
    }
  };

  // Initialize session ID
  const initSessionId = async (): Promise<void> => {
    try {
      // Try to retrieve existing session ID
      const storedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        // Create a new session ID if none exists
        const newSessionId = `session_${Date.now()}`;
        await AsyncStorage.setItem(SESSION_ID_KEY, newSessionId);
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error("Error initializing chat session ID:", error);
      // Fallback to a temporary session ID
      setSessionId(`temp_session_${Date.now()}`);
    }
  };

  // Format timestamp for UI
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Track message usage on the server
  const trackMessageUsage = async (): Promise<void> => {
    if (!isAuthenticated || !userData?.id) return;

    try {
      const response = await apiClient.trackChatMessage({
        userId: userData.id,
        sessionId: sessionId || undefined,
      });

      setDailyMessageCount(response.todayMessageCount);
    } catch (error) {
      console.error("Error tracking message usage:", error);
    }
  };

  // Send a new message
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

    // Track message usage on the server
    await trackMessageUsage();

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

      // Minimal context - just provide session ID for conversation continuity
      const context = {
        sessionId: sessionId || Date.now().toString(),
      };

      // Send the message to the API
      const aiResponseText = await apiClient.sendChatMessage(message, context);

      // Update message status to "delivered"
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );

      // Add the AI's response to the chat
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
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

      // Add an error message from the AI
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I couldn't process your message. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh chat history
  const refreshChat = async (): Promise<void> => {
    setRefreshing(true);
    // Simulate refreshing the chat history
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Clear input field
  const clearInput = (): void => {
    setInputText("");
  };

  // Check if user has reached daily limit
  const checkDailyLimit = async (): Promise<boolean> => {
    if (!isAuthenticated || !userData?.id) return false;

    // For premium users, always return false (no limit)
    if (isPremium) return false;

    // Use local count for quick check if already exceeded
    if (dailyMessageCount >= MAX_FREE_MESSAGES_PER_DAY) {
      return true;
    }

    try {
      // If not exceeded locally, double-check with the API
      return await apiClient.hasReachedChatLimit(userData.id, isPremium);
    } catch (error) {
      console.error("Error checking message limit:", error);
      // Fallback to local count if API call fails
      return dailyMessageCount >= MAX_FREE_MESSAGES_PER_DAY;
    }
  };

  // Clear chat session (for logout or reset)
  const clearChatSession = async (): Promise<void> => {
    try {
      // Generate a new session ID
      const newSessionId = `session_${Date.now()}`;
      await AsyncStorage.setItem(SESSION_ID_KEY, newSessionId);
      setSessionId(newSessionId);

      // Clear messages and reset state
      setMessages(initialMessages);
      setInputText("");
      setShowExamples(true);
    } catch (error) {
      console.error("Error clearing chat session:", error);
    }
  };

  // ===== UI Handlers =====

  // Handle message sending
  const handleSend = async () => {
    if (inputText.trim() === "") return;

    // Check for message limit for free users
    const hasReachedLimit = await checkDailyLimit();
    if (hasReachedLimit) {
      showLimitReachedDialog();
      return;
    }

    // Send the message and clear input
    sendMessage(inputText);
    clearInput();
  };

  // Show limit reached dialog for free users
  const showLimitReachedDialog = () => {
    alertDialog.showAlert({
      title: "Daily Limit Reached",
      message: `Free users can only send ${MAX_FREE_MESSAGES_PER_DAY} messages per day. Upgrade to premium for unlimited messages!`,
      buttons: [
        { text: "Later", onPress: () => {} },
        {
          text: "Upgrade",
          onPress: () => {
            router.push("/premium");
          },
        },
      ],
    });
  };

  // Handle example suggestion click
  const handleExamplePress = (example: string) => {
    setInputText(example);
  };

  // Handle clear chat confirmation
  const handleClearChat = () => {
    alertDialog.showConfirm({
      title: "Clear Chat",
      message: "Are you sure you want to clear all chat messages?",
      confirmText: "Clear",
      cancelText: "Cancel",
      onConfirm: () => clearChatSession(),
      onCancel: () => {},
    });
  };

  // Process message text (format bold text)
  const processText = (text: string) => {
    // Replace **text** with bold
    return text.replace(/\*\*(.*?)\*\*/g, "$1");
  };

  // Navigate to premium features
  const navigateToPremium = () => {
    router.push("/premium");
  };

  return {
    // State
    messages,
    inputText,
    refreshing,
    showExamples,
    dailyMessageCount,
    isAuthenticated,
    isPremium,
    flatListRef,
    userData,
    theme,
    isLoading,

    // Data operations
    formatTimestamp,
    processText,

    // User actions
    refreshChat,
    setInputText,

    // UI handlers
    handleSend,
    handleExamplePress,
    handleClearChat,
    navigateToPremium,
  };
};
