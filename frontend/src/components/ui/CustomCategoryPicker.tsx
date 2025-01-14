import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import {
  DeckCategory,
  deckCategories,
  deckCategoryMetadata,
} from "@src/types/DeckCategory";

interface Props {
  selectedCategory: DeckCategory;
  onSelectCategory: (category: DeckCategory) => void;
}

export const CustomCategoryPicker = ({
  selectedCategory,
  onSelectCategory,
}: Props) => {
  const { colors } = useThemeStyles();

  const isSelected = (category: DeckCategory) => {
    return selectedCategory === category;
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {deckCategories.map((category) => (
          <CustomButton
            key={category}
            title={deckCategoryMetadata[category].label}
            onPress={() => onSelectCategory(category)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected(category)
                  ? colors.primary
                  : "transparent",
                borderColor: isSelected(category)
                  ? colors.primary
                  : colors.border,
              },
            ]}
            textStyle={[
              styles.chipText,
              {
                color: isSelected(category) ? colors.background : colors.text,
              },
            ]}
            width="auto"
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
