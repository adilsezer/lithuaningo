import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CustomButton from "./CustomButton";
import { useTheme } from "react-native-paper";
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
  const theme = useTheme();

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
                  ? theme.colors.primary
                  : "transparent",
                borderColor: isSelected(category)
                  ? theme.colors.primary
                  : theme.colors.primaryContainer,
              },
            ]}
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
