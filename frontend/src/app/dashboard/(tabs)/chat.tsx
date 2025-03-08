import React, { useState } from "react";
import {
  View,
  FlatList,
  ListRenderItem,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useTheme,
  IconButton,
  Surface,
  Button,
  Divider,
  TextInput,
  Text,
  Card,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAlertDialog from "@hooks/useAlertDialog";
import {
  useChat,
  Message,
  MAX_FREE_MESSAGES_PER_DAY,
  CHAT_EXAMPLES,
} from "@hooks/useChat";
import CustomText from "@components/ui/CustomText";
import { useUserData } from "@stores/useUserStore";
import CustomDivider from "@components/ui/CustomDivider";

export default function ChatScreen(): JSX.Element {
  const {
    messages,
    inputText,
    isLoading,
    refreshing,
    showExamples,
    isAuthenticated,
    isPremium,
    flatListRef,
    dailyMessageCount,
    formatTimestamp,
    sendMessage,
    refreshChat,
    setInputText,
    clearInput,
    checkDailyLimit,
  } = useChat();

  const userData = useUserData();
  const alertDialog = useAlertDialog();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // UI helper functions
  const showHelpDialog = () => {
    alertDialog.showAlert({
      title: "Chat Assistant Help",
      message:
        "You can ask the AI assistant any questions about Lithuanian language learning. The assistant can:\n\n• Translate words and phrases\n• Explain grammar rules\n• Provide pronunciation tips\n• Help with vocabulary practice\n• Answer cultural questions",
      buttons: [{ text: "Close", onPress: () => {} }],
    });
  };

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Check for message limit for free users
    if (checkDailyLimit()) {
      showLimitReachedDialog();
      return;
    }

    // Send the message and clear input
    sendMessage(inputText);
    clearInput();
  };

  const showLimitReachedDialog = () => {
    alertDialog.showAlert({
      title: "Daily Limit Reached",
      message: `Free users can only send ${MAX_FREE_MESSAGES_PER_DAY} messages per day. Upgrade to premium for unlimited messages!`,
      buttons: [
        { text: "Later", onPress: () => {} },
        {
          text: "Upgrade",
          onPress: () => {
            // Navigate to subscription screen or show subscription modal
            // This would be implemented based on your app's navigation
          },
        },
      ],
    });
  };

  const handleExamplePress = (example: string) => {
    setInputText(example);
  };

  // UI Rendering functions
  const processText = (text: string) => {
    // Replace **text** with bold
    return text.replace(/\*\*(.*?)\*\*/g, "$1");
  };

  const renderItem: ListRenderItem<Message> = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isUser ? "flex-end" : "flex-start",
          alignItems: "flex-start",
          marginVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        {!isUser && (
          <Avatar.Image
            size={30}
            source={require("assets/images/icon-transparent.png")}
            style={{ marginRight: 8, marginTop: 6 }}
          />
        )}

        <View style={{ maxWidth: "80%" }}>
          <Card
            style={{
              borderRadius: 16,
              borderBottomLeftRadius: isUser ? 16 : 4,
              borderBottomRightRadius: isUser ? 4 : 16,
              backgroundColor: theme.colors.background,
              elevation: 1,
              borderWidth: 0.5,
              borderColor: isUser
                ? theme.colors.secondary
                : theme.colors.primary,
            }}
            mode="outlined"
          >
            <Card.Content style={{ padding: 12 }}>
              {item.text.split("\n\n").map((paragraph, index) => (
                <Text
                  key={index}
                  style={{
                    color: theme.colors.onSurface,
                    marginBottom:
                      index < item.text.split("\n\n").length - 1 ? 8 : 0,
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
            style={{
              color: theme.colors.outline,
              marginTop: 2,
              alignSelf: isUser ? "flex-end" : "flex-start",
            }}
          >
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        {isUser && userData?.fullName && (
          <Avatar.Text
            size={30}
            label={userData.fullName[0].toUpperCase()}
            style={{
              marginLeft: 8,
              marginTop: 6,
              backgroundColor: theme.colors.secondary,
            }}
            color={theme.colors.onPrimary}
          />
        )}
      </View>
    );
  };

  const renderExampleSuggestions = () => {
    if (!showExamples || messages.length > 1 || !isAuthenticated) return null;

    return (
      <Card
        style={{
          margin: 12,
          backgroundColor: theme.colors.background,
        }}
        mode="contained"
      >
        <Card.Title title="Try asking:" titleStyle={{ textAlign: "center" }} />
        <Card.Content>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              width: "100%",
              gap: 8,
            }}
          >
            {CHAT_EXAMPLES.map((example, index) => (
              <Button
                key={index}
                mode="outlined"
                style={{
                  borderRadius: 20,
                  height: 48,
                  justifyContent: "center",
                  width: "100%",
                  borderColor: theme.colors.secondary,
                }}
                labelStyle={{
                  fontSize: 14,
                  textAlign: "center",
                  color: theme.colors.onBackground,
                }}
                onPress={() => handleExamplePress(example)}
              >
                {example}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderFreeUserLimitInfo = () => {
    if (!isAuthenticated || isPremium) return null;

    return (
      <Surface
        style={{
          marginHorizontal: 12,
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
            }}
          >
            {MAX_FREE_MESSAGES_PER_DAY - dailyMessageCount} of{" "}
            {MAX_FREE_MESSAGES_PER_DAY} free messages left today
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => {
              /* Navigate to premium page */
            }}
            style={{ marginLeft: 8 }}
            textColor={theme.colors.primary}
          >
            Upgrade
          </Button>
        </View>
      </Surface>
    );
  };

  const renderLoginPrompt = () => {
    if (isAuthenticated) return null;

    return (
      <Surface
        style={{
          margin: 10,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "#FFF3CD",
          borderWidth: 1,
          borderColor: "#FFEEBA",
        }}
      >
        <Text style={{ color: "#856404", textAlign: "center" }}>
          Please log in to use the AI assistant.
        </Text>
      </Surface>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: insets.bottom,
      }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          alignSelf: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <CustomText variant="titleLarge" bold>
          Lithuaningo AI Assistant
        </CustomText>
        <IconButton
          icon="help-circle-outline"
          size={24}
          onPress={showHelpDialog}
        />
      </View>
      <Divider />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshChat}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={
          isLoading ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
                marginLeft: 16,
              }}
            >
              <ActivityIndicator size="small" />
              <Text
                variant="bodyMedium"
                style={{ marginLeft: 8, color: theme.colors.outline }}
              >
                AI is typing...
              </Text>
            </View>
          ) : null
        }
      />

      {renderExampleSuggestions()}
      {renderLoginPrompt()}
      {renderFreeUserLimitInfo()}

      <CustomDivider />

      <TextInput
        mode="outlined"
        placeholder="Type a message..."
        value={inputText}
        onChangeText={setInputText}
        multiline
        style={{
          backgroundColor: theme.colors.background,
          marginHorizontal: 12,
        }}
        contentStyle={{
          marginVertical: 12,
          marginHorizontal: 4,
        }}
        outlineStyle={{
          borderRadius: 24,
          borderColor: theme.colors.primary,
        }}
        disabled={isLoading || !isAuthenticated}
        right={
          <TextInput.Icon
            icon="send"
            color={theme.colors.primary}
            disabled={isLoading || inputText.trim() === "" || !isAuthenticated}
            onPress={handleSend}
            style={{
              marginTop: "auto",
              marginBottom: "auto",
              alignSelf: "center",
            }}
          />
        }
      />
    </KeyboardAvoidingView>
  );
}
