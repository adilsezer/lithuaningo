import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ListRenderItem,
  Image,
} from "react-native";
import { Card, IconButton, useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomDivider from "@components/ui/CustomDivider";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
// Define a TypeScript interface for our messages.
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

const dummyMessages: Message[] = [
  { id: "1", text: "Sveiki! Kaip galiu jums padėti?", sender: "ai" },
  { id: "2", text: "Kaip šiandien jautiesi?", sender: "user" },
];

export default function ChatScreen(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [inputText, setInputText] = useState<string>("");

  const theme = useTheme();

  const handleSend = (): void => {
    if (inputText.trim() === "") return;

    // Add the user's message to the chat.
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

    // Simulate an AI response after a short delay.
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString() + "_ai",
        text: "Atsakymas: Dėkoju už jūsų klausimą!",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);
  };

  const renderItem: ListRenderItem<Message> = ({ item }) => (
    <Card
      style={[
        styles.messageCard,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Card.Content>
        <CustomText>{item.text}</CustomText>
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
      <View style={styles.inputContainer}>
        <CustomTextInput
          mode="outlined"
          placeholder="Rašykite žinutę..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.textInput}
        />
        <IconButton icon="send" size={28} onPress={handleSend} />
      </View>
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
});
