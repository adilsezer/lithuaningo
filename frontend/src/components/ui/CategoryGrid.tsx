import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useTheme } from "react-native-paper";
import CategoryCard, { FlashcardCategory } from "./CategoryCard";
import CustomText from "./CustomText";

interface CategoryGridProps {
  categories: FlashcardCategory[];
  onPressPractice: (category: FlashcardCategory) => void;
  onPressMaster?: (category: FlashcardCategory) => void;
  title?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onPressPractice,
  onPressMaster,
  title,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <CustomText
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {title}
        </CustomText>
      )}

      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPressPractice={onPressPractice}
            onPressMaster={onPressMaster}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: "left",
    marginBottom: 12,
    marginLeft: 6,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CategoryGrid;
