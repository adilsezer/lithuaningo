import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, IconButton, useTheme, Surface } from "react-native-paper";
import CustomText from "./CustomText";

interface FlashcardItemProps {
  id: string;
  frontWord: string;
  backWord: string;
  imageUrl?: string;
  level?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({
  id,
  frontWord,
  backWord,
  imageUrl,
  level,
  onEdit,
  onDelete,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress && onPress(id)}
    >
      <Card.Content style={styles.content}>
        <View style={styles.textContainer}>
          <CustomText variant="titleMedium" bold numberOfLines={1}>
            {frontWord}
          </CustomText>
          <CustomText variant="bodyMedium" numberOfLines={1}>
            {backWord}
          </CustomText>
          {level && (
            <View style={styles.levelContainer}>
              <CustomText
                variant="labelSmall"
                style={{ color: theme.colors.primary }}
              >
                {level}
              </CustomText>
            </View>
          )}
        </View>
        {imageUrl && (
          <Card.Cover source={{ uri: imageUrl }} style={styles.image} />
        )}
      </Card.Content>
      <View style={styles.actions}>
        <IconButton
          icon="pencil"
          size={20}
          onPress={() => onEdit(id)}
          iconColor={theme.colors.primary}
        />
        <IconButton
          icon="delete"
          size={20}
          onPress={() => onDelete(id)}
          iconColor={theme.colors.error}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
  },
  levelContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginTop: 4,
  },
});
