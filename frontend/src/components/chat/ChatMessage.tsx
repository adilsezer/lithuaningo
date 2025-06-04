import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, Card, Avatar, useTheme } from "react-native-paper";
import { Message } from "@hooks/useChat";
import MarkdownDisplay from "react-native-markdown-display";

interface ChatMessageProps {
  message: Message;
  userData?: { fullName?: string } | null;
  formatTimestamp: (timestamp: Date) => string;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(
  ({ message, userData, formatTimestamp }) => {
    const theme = useTheme();
    const isUser = message.sender === "user";

    // Memoize the formatted timestamp to avoid recalculation
    const formattedTime = React.useMemo(
      () => formatTimestamp(message.timestamp),
      [formatTimestamp, message.timestamp]
    );

    // Memoize markdown styles to avoid recreation on every render
    const markdownStyle = React.useMemo(
      () => ({
        body: {
          color: theme.colors.onSurface,
          fontSize: 15,
          lineHeight: 22,
        },
        heading1: {
          color: theme.colors.onSurface,
          fontSize: 24, // Example size, adjust as needed
          fontWeight: "bold" as const,
          marginTop: 10,
          marginBottom: 5,
        },
        heading2: {
          color: theme.colors.onSurface,
          fontSize: 20, // Example size
          fontWeight: "bold" as const,
          marginTop: 8,
          marginBottom: 4,
        },
        // Add more styles for other markdown elements like strong, em, listItem, etc.
        strong: {
          fontWeight: "bold" as const,
        },
        em: {
          fontStyle: "italic" as const,
        },
        listItemBullet: {
          color: theme.colors.onSurfaceVariant || theme.colors.onSurface, // Use theme color for bullets
          fontSize: 18, // Adjust bullet size if needed
        },
        listItemNumber: {
          color: theme.colors.onSurfaceVariant || theme.colors.onSurface, // Use theme color for numbers
          fontWeight: "bold" as const,
        },
        // You might need to style `list` and `listItem` for padding/margin if default isn't ideal
        code_inline: {
          // Added for inline code `` `text` ``
          backgroundColor: theme.colors.background, // A subtle background
          color: theme.colors.secondary, // Ensure text is visible
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", // Monospace font
        },
      }),
      [theme.colors]
    );

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
            source={require("../../../assets/images/icon-transparent.png")}
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
            <Card.Content style={[styles.cardContent, { paddingVertical: 10 }]}>
              {/* Use MarkdownDisplay to render message.text */}
              <MarkdownDisplay style={markdownStyle}>
                {message.text}
              </MarkdownDisplay>
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
            {formattedTime}
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
  }
);

ChatMessage.displayName = "ChatMessage";

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
    paddingHorizontal: 12,
  },
  timestamp: {
    marginTop: 2,
  },
});

export default ChatMessage;
