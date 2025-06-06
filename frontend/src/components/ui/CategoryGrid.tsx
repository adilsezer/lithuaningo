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

const CategoryGrid: React.FC<CategoryGridProps> = React.memo(
  ({ categories, onPressPractice, onPressMaster, title }) => {
    const theme = useTheme();

    // Memoize renderItem to prevent recreations
    const renderCategory = React.useCallback(
      ({ item }: { item: FlashcardCategory }) => (
        <CategoryCard
          category={item}
          onPressPractice={onPressPractice}
          onPressMaster={onPressMaster}
        />
      ),
      [onPressPractice, onPressMaster]
    );

    // Memoize keyExtractor
    const keyExtractor = React.useCallback(
      (item: FlashcardCategory) => item.id,
      []
    );

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
          renderItem={renderCategory}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
        />
      </View>
    );
  }
);

CategoryGrid.displayName = "CategoryGrid";

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
