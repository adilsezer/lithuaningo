import React from "react";
import {
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat } from "@hooks/useChat";
import CustomText from "@components/ui/CustomText";
import CustomDivider from "@components/ui/CustomDivider";
import ChatMessage from "@components/chat/ChatMessage";
import ChatInput from "@components/chat/ChatInput";
import ChatExampleSuggestions from "@components/chat/ChatExampleSuggestions";
import ChatUsageLimitInfo from "@components/chat/ChatUsageLimitInfo";
import LoginPrompt from "@components/chat/LoginPrompt";

export default function ChatScreen(): JSX.Element {
  const {
    messages,
    inputText,
    refreshing,
    showExamples,
    isAuthenticated,
    isPremium,
    dailyMessageCount,
    flatListRef,
    userData,
    theme,
    isLoading,

    formatTimestamp,
    refreshChat,
    setInputText,
    handleSend,
    handleExamplePress,
    handleClearChat,
    processText,
    navigateToPremium,
  } = useChat();

  const insets = useSafeAreaInsets();

  // Render loading indicator in chat
  const renderLoadingIndicator = () => {
    if (!isLoading) return null;

    return (
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
      <CustomText variant="titleLarge" bold>
        Lithuaningo AI Assistant
      </CustomText>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            userData={userData}
            formatTimestamp={formatTimestamp}
            processText={processText}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshChat}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={renderLoadingIndicator()}
      />

      {/* Example Suggestions */}
      {showExamples && messages.length <= 1 && isAuthenticated && (
        <ChatExampleSuggestions onExamplePress={handleExamplePress} />
      )}

      {/* Login Prompt */}
      {!isAuthenticated && <LoginPrompt />}

      {/* Free User Limit Info */}
      {isAuthenticated && !isPremium && (
        <ChatUsageLimitInfo
          dailyMessageCount={dailyMessageCount}
          onUpgradePress={navigateToPremium}
        />
      )}

      <CustomDivider />

      {/* Chat Input */}
      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onClearChat={handleClearChat}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        showClearButton={messages.length > 0}
      />
    </KeyboardAvoidingView>
  );
}
