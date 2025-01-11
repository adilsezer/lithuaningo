import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import { ViewMode } from "@hooks/useDecks";
import { deckCategories } from "@src/types/DeckCategory";

const viewModes = [
  { id: "all" as const, label: "All Decks" },
  { id: "top" as const, label: "Top Rated" },
  { id: "my" as const, label: "My Decks" },
];

interface Props {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const CategoryPicker = ({
  selectedCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
}: Props) => {
  const { colors } = useThemeStyles();

  const isSelected = (category: string) => {
    return selectedCategory === category;
  };

  const isViewModeSelected = (mode: ViewMode) => {
    return viewMode === mode && selectedCategory === "";
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {viewModes.map((mode) => (
          <CustomButton
            key={mode.id}
            title={mode.label}
            onPress={() => {
              onViewModeChange(mode.id);
              onSelectCategory("");
            }}
            style={[
              styles.chip,
              {
                backgroundColor: isViewModeSelected(mode.id)
                  ? colors.primary
                  : "transparent",
                borderColor: isViewModeSelected(mode.id)
                  ? colors.primary
                  : colors.border,
              },
            ]}
            textStyle={[
              styles.chipText,
              {
                color: isViewModeSelected(mode.id)
                  ? colors.background
                  : colors.text,
              },
            ]}
            width="auto"
          />
        ))}
        {deckCategories.map((category) => (
          <CustomButton
            key={category}
            title={category}
            onPress={() => {
              onSelectCategory(category);
              onViewModeChange("all");
            }}
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
