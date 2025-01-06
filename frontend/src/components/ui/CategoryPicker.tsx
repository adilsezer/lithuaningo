import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

const categories = ["All", "Beginner", "Advanced", "Verbs"];

interface Props {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPicker = ({
  selectedCategory,
  onSelectCategory,
}: Props) => {
  const { colors } = useThemeStyles();

  const isSelected = (category: string) => {
    if (category === "All") {
      return selectedCategory === "";
    }
    return selectedCategory === category;
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            activeOpacity={0.7}
            onPress={() => onSelectCategory(category === "All" ? "" : category)}
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
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected(category) ? colors.background : colors.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
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
