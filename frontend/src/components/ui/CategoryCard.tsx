import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, TouchableRipple, useTheme } from "react-native-paper";
import CustomText from "./CustomText";

export type FlashcardCategory = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

interface CategoryCardProps {
  category: FlashcardCategory;
  onPress: (category: FlashcardCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const theme = useTheme();
  const backgroundColor = category.color || theme.colors.primaryContainer;

  return (
    <Surface style={styles.surface} elevation={0}>
      <TouchableRipple
        style={styles.touchable}
        onPress={() => onPress(category)}
        rippleColor={theme.colors.primary + "20"}
      >
        <View style={styles.container}>
          <View style={[styles.colorIndicator, { backgroundColor }]} />
          <View style={styles.content}>
            <CustomText variant="titleMedium" style={styles.title}>
              {category.name}
            </CustomText>
            {category.description && (
              <CustomText variant="bodyMedium" style={styles.description}>
                {category.description}
              </CustomText>
            )}
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    borderRadius: 12,
    marginVertical: 6,
    overflow: "hidden",
  },
  touchable: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  colorIndicator: {
    width: 16,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    textAlign: "left",
    fontWeight: "bold",
  },
  description: {
    textAlign: "left",
    opacity: 0.7,
    marginTop: 4,
  },
});

export default CategoryCard;
