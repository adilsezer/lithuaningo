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

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  userData,
  formatTimestamp,
}) => {
  const theme = useTheme();
  const isUser = message.sender === "user";

  // Define base styles for Markdown content based on the theme
  // These can be expanded significantly for more granular control (headings, links, code blocks, etc.)
  const markdownStyle = {
    body: {
      color: theme.colors.onSurface,
      fontSize: 15,
      lineHeight: 22,
    },
    heading1: {
      color: theme.colors.onSurface,
      fontSize: 24, // Example size, adjust as needed
      fontWeight: "bold" as "bold",
      marginTop: 10,
      marginBottom: 5,
    },
    heading2: {
      color: theme.colors.onSurface,
      fontSize: 20, // Example size
      fontWeight: "bold" as "bold",
      marginTop: 8,
      marginBottom: 4,
    },
    // Add more styles for other markdown elements like strong, em, listItem, etc.
    strong: {
      fontWeight: "bold" as "bold",
    },
    em: {
      fontStyle: "italic" as "italic",
    },
    listItemBullet: {
      color: theme.colors.onSurfaceVariant || theme.colors.onSurface, // Use theme color for bullets
      fontSize: 18, // Adjust bullet size if needed
    },
    listItemNumber: {
      color: theme.colors.onSurfaceVariant || theme.colors.onSurface, // Use theme color for numbers
      fontWeight: "bold" as "bold",
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
  };

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
    paddingHorizontal: 12,
  },
  timestamp: {
    marginTop: 2,
  },
});

export default ChatMessage;
