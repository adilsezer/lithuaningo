import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, useTheme } from 'react-native-paper';
import { CHAT_EXAMPLES } from '@hooks/useChat';

interface ChatExampleSuggestionsProps {
  onExamplePress: (example: string) => void;
}

const ChatExampleSuggestions: React.FC<ChatExampleSuggestionsProps> = ({
  onExamplePress,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      mode='contained'
    >
      <Card.Title title='Try asking:' titleStyle={styles.title} />
      <Card.Content>
        <View style={styles.buttonContainer}>
          {CHAT_EXAMPLES.map((example) => (
            <Button
              key={example}
              mode='outlined'
              style={[
                styles.exampleButton,
                {
                  borderColor: theme.colors.secondary,
                },
              ]}
              labelStyle={[
                styles.buttonLabel,
                {
                  color: theme.colors.onBackground,
                },
              ]}
              onPress={() => onExamplePress(example)}
            >
              {example}
            </Button>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 12,
  },
  title: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  exampleButton: {
    borderRadius: 20,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  buttonLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChatExampleSuggestions;
