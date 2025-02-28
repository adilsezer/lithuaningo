import React from "react";
import { StyleSheet } from "react-native";
import { Card, IconButton, useTheme } from "react-native-paper";
import CustomText from "./CustomText";

interface FlashcardItemProps {
  id: string;
  frontWord: string;
  backWord: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({
  id,
  frontWord,
  backWord,
  onEdit,
  onDelete,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Card
      mode="outlined"
      style={[styles.card, { borderColor: theme.colors.primary }]}
      onPress={() => onPress?.(id)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Flashcard: ${frontWord}, meaning ${backWord}`}
    >
      <Card.Title
        title={frontWord}
        subtitle={backWord}
        titleStyle={[styles.title, { color: theme.colors.primary }]}
        subtitleStyle={styles.subtitle}
        right={(props) => (
          <>
            <IconButton
              {...props}
              icon="pencil-outline"
              iconColor={theme.colors.primary}
              size={20}
              onPress={() => onEdit(id)}
              accessibilityLabel="Edit flashcard"
            />
            <IconButton
              {...props}
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              size={20}
              onPress={() => onDelete(id)}
              accessibilityLabel="Delete flashcard"
            />
          </>
        )}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
