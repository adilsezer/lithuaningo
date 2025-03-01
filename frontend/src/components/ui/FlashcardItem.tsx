import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, IconButton, useTheme, Surface } from "react-native-paper";
import CustomText from "./CustomText";

interface FlashcardItemProps {
  id: string;
  frontWord: string;
  backWord: string;
  imageUrl?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({
  id,
  frontWord,
  backWord,
  imageUrl,
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
      contentStyle={styles.cardContent}
    >
      <Card.Content style={styles.contentContainer}>
        {imageUrl && (
          <Surface style={styles.imageContainer} elevation={0}>
            <Card.Cover
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </Surface>
        )}
        <View style={styles.textContainer}>
          <CustomText
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.primary }]}
            numberOfLines={1}
          >
            {frontWord}
          </CustomText>
          <CustomText
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {backWord}
          </CustomText>
        </View>
        <Card.Actions style={styles.actionsContainer}>
          <IconButton
            icon="pencil-outline"
            iconColor={theme.colors.primary}
            size={18}
            onPress={() => onEdit(id)}
            accessibilityLabel="Edit flashcard"
            style={styles.actionButton}
            mode="contained-tonal"
          />
          <IconButton
            icon="trash-can-outline"
            iconColor={theme.colors.error}
            size={18}
            onPress={() => onDelete(id)}
            accessibilityLabel="Delete flashcard"
            style={styles.actionButton}
            mode="contained-tonal"
          />
        </Card.Actions>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    height: 56,
    width: 56,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  actionsContainer: {
    padding: 0,
    margin: 0,
    gap: 4,
  },
  actionButton: {
    margin: 0,
  },
});
