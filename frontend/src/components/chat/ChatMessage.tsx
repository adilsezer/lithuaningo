import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Avatar, useTheme } from "react-native-paper";
import { Message } from "@hooks/useChat";

interface ChatMessageProps {
  message: Message;
  userData?: { fullName?: string } | null;
  formatTimestamp: (timestamp: Date) => string;
  processText: (text: string) => string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  userData,
  formatTimestamp,
  processText,
}) => {
  const theme = useTheme();
  const isUser = message.sender === "user";

  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: isUser ? "flex-end" : "flex-start",
        },
      ]}
    >
      {!isUser && (
        <Avatar.Image
          size={35}
          source={require("assets/images/icon-transparent.png")}
          style={styles.aiAvatar}
        />
      )}

      <View style={styles.messageWrapper}>
        <Card
          style={[
            styles.messageCard,
            {
              borderBottomLeftRadius: isUser ? 16 : 4,
              borderBottomRightRadius: isUser ? 4 : 16,
              backgroundColor: theme.colors.background,
              borderColor: isUser
                ? theme.colors.secondary
                : theme.colors.primary,
            },
          ]}
          mode="outlined"
        >
          <Card.Content style={styles.cardContent}>
            {message.text.split("\n\n").map((paragraph, index) => (
              <Text
                key={index}
                style={{
                  color: theme.colors.onSurface,
                  marginBottom:
                    index < message.text.split("\n\n").length - 1 ? 8 : 0,
                }}
              >
                {paragraph.split("\n").map((line, lineIndex) => (
                  <Text
                    key={`line-${lineIndex}`}
                    style={{
                      fontWeight:
                        line.startsWith("**") && line.endsWith("**")
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {processText(line)}
                    {lineIndex < paragraph.split("\n").length - 1 ? "\n" : ""}
                  </Text>
                ))}
              </Text>
            ))}
          </Card.Content>
        </Card>

        <Text
          variant="labelSmall"
          style={[
            styles.timestamp,
            {
              color: theme.colors.outline,
              alignSelf: isUser ? "flex-end" : "flex-start",
            },
          ]}
        >
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>

      {isUser && userData?.fullName && (
        <Avatar.Text
          size={35}
          label={userData.fullName[0].toUpperCase()}
          style={[
            styles.userAvatar,
            {
              backgroundColor: theme.colors.secondary,
            },
          ]}
          color={theme.colors.onPrimary}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  aiAvatar: {
    marginRight: 8,
    marginTop: 6,
  },
  userAvatar: {
    marginLeft: 8,
    marginTop: 6,
  },
  messageWrapper: {
    maxWidth: "80%",
  },
  messageCard: {
    borderRadius: 16,
    elevation: 1,
    borderWidth: 0.5,
  },
  cardContent: {
    padding: 12,
  },
  timestamp: {
    marginTop: 2,
  },
});

export default ChatMessage;
