import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { MAX_FREE_MESSAGES_PER_DAY } from '@hooks/useChat';

interface ChatUsageLimitInfoProps {
  dailyMessageCount: number;
  onUpgradePress: () => void;
}

const ChatUsageLimitInfo: React.FC<ChatUsageLimitInfoProps> = ({
  dailyMessageCount,
  onUpgradePress,
}) => {
  const theme = useTheme();

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            {
              color: theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {MAX_FREE_MESSAGES_PER_DAY - dailyMessageCount} of{' '}
          {MAX_FREE_MESSAGES_PER_DAY} free messages left today
        </Text>
        <Button
          mode="text"
          compact
          onPress={onUpgradePress}
          style={styles.button}
          textColor={theme.colors.primary}
        >
          Upgrade
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  button: {
    marginLeft: 8,
  },
});

export default ChatUsageLimitInfo;
