import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onClearChat: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  showClearButton: boolean;
  hasReachedLimit?: boolean;
  isPremium?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onClearChat,
  isLoading,
  isAuthenticated,
  showClearButton,
  hasReachedLimit = false,
  isPremium = false,
}) => {
  const theme = useTheme();
  const isDisabled =
    isLoading || !isAuthenticated || (hasReachedLimit && !isPremium);

  return (
    <TextInput
      mode="outlined"
      placeholder={
        isDisabled && hasReachedLimit
          ? 'Daily message limit reached'
          : 'Type a message...'
      }
      value={value}
      onChangeText={onChangeText}
      multiline
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      contentStyle={styles.inputContent}
      outlineStyle={[
        styles.inputOutline,
        {
          borderColor: theme.colors.primary,
        },
      ]}
      disabled={isDisabled}
      left={
        showClearButton && isAuthenticated ? (
          <TextInput.Icon
            icon="trash-can-outline"
            color={theme.colors.secondary}
            onPress={onClearChat}
            style={styles.iconStyle}
          />
        ) : null
      }
      right={
        <TextInput.Icon
          icon="send"
          color={theme.colors.primary}
          disabled={isDisabled || value.trim() === ''}
          onPress={onSend}
          style={styles.iconStyle}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
  inputContent: {
    marginVertical: 12,
    marginHorizontal: 4,
  },
  inputOutline: {
    borderRadius: 24,
  },
  iconStyle: {
    marginTop: 'auto',
    marginBottom: 'auto',
    alignSelf: 'center',
  },
});

export default ChatInput;
