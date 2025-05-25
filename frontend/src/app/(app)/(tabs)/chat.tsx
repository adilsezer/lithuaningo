import React, { useMemo } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, ActivityIndicator, Avatar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat, MAX_FREE_MESSAGES_PER_DAY, Message } from "@hooks/useChat";
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
    navigateToPremium,
  } = useChat();

  const insets = useSafeAreaInsets();

  // Calculate if user has reached daily limit
  const hasReachedLimit = useMemo(() => {
    return dailyMessageCount >= MAX_FREE_MESSAGES_PER_DAY;
  }, [dailyMessageCount]);

  // Memoize the renderItem function to prevent recreations
  const renderChatMessage = React.useCallback(
    ({ item }: { item: Message }) => (
      <ChatMessage
        message={item}
        userData={userData}
        formatTimestamp={formatTimestamp}
      />
    ),
    [userData, formatTimestamp]
  );

  // Memoize keyExtractor to prevent recreations
  const keyExtractor = React.useCallback((item: Message) => item.id, []);

  // Render loading indicator in chat
  const renderLoadingIndicator = React.useCallback(() => {
    if (!isLoading) {
      return null;
    }

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginVertical: 8,
        }}
      >
        <Avatar.Image
          source={require("../../../../assets/images/icon-transparent.png")}
          size={35}
          style={{ marginRight: 8, marginTop: 6 }}
        />
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
        >
          <ActivityIndicator size="small" />
          <Text
            variant="bodyMedium"
            style={{ marginLeft: 8, color: theme.colors.outline }}
          >
            Lithuaningo AI is typing...
          </Text>
        </View>
      </View>
    );
  }, [isLoading, theme.colors.outline]);

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
        keyExtractor={keyExtractor}
        renderItem={renderChatMessage}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshChat}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={renderLoadingIndicator}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={undefined} // Let FlatList handle dynamic heights
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
        hasReachedLimit={hasReachedLimit}
        isPremium={isPremium}
      />
    </KeyboardAvoidingView>
  );
}
