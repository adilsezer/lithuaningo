import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ListRenderItem,
  Image,
  ActivityIndicator,
} from "react-native";
import { Card, IconButton, useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomDivider from "@components/ui/CustomDivider";
import { apiClient } from "@services/api/apiClient";
import { useIsAuthenticated } from "@stores/useUserStore";

// Define a TypeScript interface for our messages.
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! How can I help you learn Lithuanian?",
    sender: "ai",
  },
];

export default function ChatScreen(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAuthenticated = useIsAuthenticated();

  const theme = useTheme();

  const handleSend = async (): Promise<void> => {
    if (inputText.trim() === "" || !isAuthenticated) return;

    // Add the user's message to the chat.
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const userMessage = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Send the message to the API and get the response
      const aiResponseText = await apiClient.sendChatMessage(userMessage);

      // Add the AI's response to the chat
      const aiResponse: Message = {
        id: Date.now().toString() + "_ai",
        text: aiResponseText,
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Add an error message
      const errorMessage: Message = {
        id: Date.now().toString() + "_error",
        text: "Sorry, an error occurred. Please try again later.",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem: ListRenderItem<Message> = ({ item }) => (
    <Card
      style={[
        styles.messageCard,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Card.Content>
        <CustomText style={{ color: theme.colors.onPrimaryContainer }}>
          {item.text}
        </CustomText>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <CustomText variant="titleLarge" bold>
        Lithuaningo AI Assistant
      </CustomText>
      <Image
        source={require("assets/images/icon-transparent.png")}
        style={styles.image}
        accessibilityLabel="Welcome to Lithuaningo"
      />
      <CustomDivider />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <CustomText style={styles.loadingText}>
            AI is typing a response...
          </CustomText>
        </View>
      )}
      <View style={styles.inputContainer}>
        <CustomTextInput
          mode="outlined"
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.textInput}
          disabled={isLoading || !isAuthenticated}
        />
        <IconButton
          icon="send"
          size={28}
          onPress={handleSend}
          disabled={isLoading || inputText.trim() === "" || !isAuthenticated}
        />
      </View>
      {!isAuthenticated && (
        <View style={styles.authWarning}>
          <CustomText style={styles.authWarningText}>
            Please log in to use the AI assistant.
          </CustomText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    alignSelf: "center",
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageCard: {
    marginVertical: 5,
    padding: 5,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  textInput: {
    flex: 1,
    marginRight: 10,
    marginVertical: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  authWarning: {
    backgroundColor: "#FFF3CD",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFEEBA",
  },
  authWarningText: {
    color: "#856404",
    textAlign: "center",
  },
});
