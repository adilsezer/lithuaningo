import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, FlatList, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import CustomText from '@components/ui/CustomText';
import CategoryGrid from '@components/ui/CategoryGrid';
import { FlashcardCategory } from '@components/ui/CategoryCard';
import CustomDivider from '@components/ui/CustomDivider';
import {
  FlashcardCategory as FlashcardCategoryEnum,
  DifficultyLevel,
} from '@src/types/Flashcard';
import { UserFlashcardStatsSummaryResponse } from '@src/types/UserFlashcardStats';
import { UserFlashcardStatsCard } from '@components/ui/UserFlashcardStatsCard';
import { useUserData, useIsPremium } from '@stores/useUserStore';
import {
  useFlashcardStore,
  DAILY_FLASHCARD_LIMIT,
} from '@stores/useFlashcardStore';

export default function FlashcardScreen() {
  const theme = useTheme();
  const userData = useUserData();
  const isPremium = useIsPremium();

  // Get data from the flashcard store for consistent daily limit display
  const {
    flashcardsViewedToday,
    syncFlashcardCount,
    isLoading: isSyncingCount,
    statsSummary,
    isLoadingStats,
    resetSession,
  } = useFlashcardStore();

  // Sync flashcard count when screen loads and reset session state
  useEffect(() => {
    if (userData?.id) {
      syncFlashcardCount(userData.id);
    }

    // Clean up any previous flashcard session
    resetSession();
  }, [userData?.id, syncFlashcardCount, resetSession]);

  // Refresh stats when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userData?.id) {
        syncFlashcardCount(userData.id);
      }
    }, [userData?.id, syncFlashcardCount])
  );

  // Helper function to get theme color based on index
  const getColor = React.useCallback(
    (index: number) => {
      const colors = [
        theme.colors.secondary,
        theme.colors.primary,
        theme.colors.tertiary,
      ];
      return colors[index % colors.length];
    },
    [theme.colors]
  );

  // Memoize sections to prevent recreation
  const sections = React.useMemo(() => {
    // Difficulty level categories
    const difficultyCategories: FlashcardCategory[] = [
      {
        id: DifficultyLevel.Basic.toString(),
        name: 'Basic',
        description: 'Essential words for beginners',
        color: theme.colors.secondary,
      },
      {
        id: DifficultyLevel.Intermediate.toString(),
        name: 'Intermediate',
        description: 'Medium difficulty words and phrases',
        color: theme.colors.primary,
      },
      {
        id: DifficultyLevel.Advanced.toString(),
        name: 'Advanced',
        description: 'Complex words and expressions',
        color: theme.colors.tertiary,
      },
    ];

    // Grammatical categories
    const grammaticalCategories: FlashcardCategory[] = [
      {
        id: FlashcardCategoryEnum.Verb.toString(),
        name: 'Verbs',
        description: 'Action words like eat, sleep, run',
        color: getColor(0),
      },
      {
        id: FlashcardCategoryEnum.Noun.toString(),
        name: 'Nouns',
        description: 'People, places, things, and ideas',
        color: getColor(1),
      },
      {
        id: FlashcardCategoryEnum.Adjective.toString(),
        name: 'Adjectives',
        description: 'Words that describe nouns',
        color: getColor(2),
      },
      {
        id: FlashcardCategoryEnum.Adverb.toString(),
        name: 'Adverbs',
        description: 'Words that modify verbs, adjectives, or other adverbs',
        color: getColor(0),
      },
      {
        id: FlashcardCategoryEnum.Pronoun.toString(),
        name: 'Pronouns',
        description: 'Words that replace nouns',
        color: getColor(1),
      },
      {
        id: FlashcardCategoryEnum.Connector.toString(),
        name: 'Connectors',
        description: 'Words that connect phrases or sentences',
        color: getColor(2),
      },
    ];

    // Thematic categories
    const thematicCategories: FlashcardCategory[] = [
      {
        id: FlashcardCategoryEnum.Greeting.toString(),
        name: 'Greetings',
        description: 'Common expressions to say hello',
        color: getColor(0),
      },
      {
        id: FlashcardCategoryEnum.Phrase.toString(),
        name: 'Phrases',
        description: 'Useful everyday expressions',
        color: getColor(1),
      },
      {
        id: FlashcardCategoryEnum.Number.toString(),
        name: 'Numbers',
        description: 'Counting, quantities, and math terms',
        color: getColor(2),
      },
      {
        id: FlashcardCategoryEnum.TimeWord.toString(),
        name: 'Time',
        description: 'Days, months, seasons, and time expressions',
        color: getColor(0),
      },
      {
        id: FlashcardCategoryEnum.Food.toString(),
        name: 'Food',
        description: 'Food, drinks, and cooking terms',
        color: getColor(1),
      },
      {
        id: FlashcardCategoryEnum.Travel.toString(),
        name: 'Travel',
        description: 'Transportation, directions, and travel vocabulary',
        color: getColor(2),
      },
      {
        id: FlashcardCategoryEnum.Family.toString(),
        name: 'Family',
        description: 'Family members and relationships',
        color: getColor(0),
      },
      {
        id: FlashcardCategoryEnum.Work.toString(),
        name: 'Work',
        description: 'Jobs, professions, and workplace vocabulary',
        color: getColor(1),
      },
      {
        id: FlashcardCategoryEnum.Nature.toString(),
        name: 'Nature',
        description: 'Animals, plants, and natural phenomena',
        color: getColor(2),
      },
    ];

    // All categories option
    const allCategories: FlashcardCategory[] = [
      {
        id: FlashcardCategoryEnum.AllCategories.toString(),
        name: 'All Categories',
        description: 'Flashcards from all categories',
        color: theme.colors.tertiary,
      },
    ];

    return [
      { id: 'header', type: 'header' },
      { id: 'stats-subtitle', type: 'stats-subtitle' },
      { id: 'stats', type: 'stats' },
      { id: 'limit-info', type: 'limit-info' },
      { id: 'category-subtitle', type: 'category-subtitle' },
      {
        id: 'all',
        type: 'category',
        title: 'All Flashcards',
        data: allCategories,
      },
      {
        id: 'difficulty',
        type: 'category',
        title: 'By Difficulty',
        data: difficultyCategories,
      },
      {
        id: 'grammatical',
        type: 'category',
        title: 'Grammatical Categories',
        data: grammaticalCategories,
      },
      {
        id: 'thematic',
        type: 'category',
        title: 'Thematic Categories',
        data: thematicCategories,
      },
    ];
  }, [theme.colors, getColor]);

  // Renamed from handleSelectCategory
  const handlePressPractice = React.useCallback(
    (category: FlashcardCategory) => {
      // Navigate to category flashcards screen
      router.push({
        pathname: '/(app)/flashcard/[id]',
        params: {
          id: category.id,
          name: category.name,
        },
      });
    },
    []
  );

  // Renamed from handleSelectReview to handleSelectMaster
  const handleSelectMaster = React.useCallback(
    (category: FlashcardCategory) => {
      router.push({
        pathname: '/(app)/flashcard-challenge/[id]', // Navigate to the new screen
        params: { id: category.id, name: category.name }, // Pass category id and name
      });
    },
    []
  );

  // Memoize each section type component to prevent unnecessary re-renders
  const HeaderSection = React.memo(() => (
    <View>
      <CustomText variant='titleLarge' bold style={styles.title}>
        Flashcards
      </CustomText>
    </View>
  ));
  HeaderSection.displayName = 'HeaderSection';

  const CategorySubtitleSection = React.memo(() => (
    <CustomText variant='bodyLarge' style={styles.subtitle}>
      Choose a category to practice
    </CustomText>
  ));
  CategorySubtitleSection.displayName = 'CategorySubtitleSection';

  const StatsSubtitleSection = React.memo(() => (
    <CustomText variant='bodyLarge' style={styles.subtitle}>
      Your Learning Progress
    </CustomText>
  ));
  StatsSubtitleSection.displayName = 'StatsSubtitleSection';

  const LimitInfoSection = React.memo(() =>
    !isPremium ? (
      <View
        style={[
          styles.limitInfoContainer,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <CustomText variant='bodyMedium'>
          Daily Usage: {flashcardsViewedToday}/{DAILY_FLASHCARD_LIMIT}{' '}
          flashcards viewed
        </CustomText>
        {flashcardsViewedToday >= DAILY_FLASHCARD_LIMIT && (
          <CustomText
            variant='bodySmall'
            style={[styles.limitWarning, { color: theme.colors.error }]}
          >
            You've reached your daily limit. Upgrade to premium for unlimited
            access!
          </CustomText>
        )}
      </View>
    ) : null
  );
  LimitInfoSection.displayName = 'LimitInfoSection';

  const StatsSection = React.memo(() =>
    userData?.id ? (
      statsSummary ? (
        <UserFlashcardStatsCard
          stats={statsSummary}
          isLoading={isLoadingStats || isSyncingCount}
        />
      ) : isLoadingStats || isSyncingCount ? (
        <UserFlashcardStatsCard
          stats={{} as UserFlashcardStatsSummaryResponse}
          isLoading
        />
      ) : null
    ) : null
  );
  StatsSection.displayName = 'StatsSection';

  const CategorySection = React.memo(
    ({ title, data }: { title?: string; data?: FlashcardCategory[] }) => (
      <>
        <CustomDivider />
        <View style={styles.categoryContainer}>
          <CategoryGrid
            categories={data ?? []}
            onPressPractice={handlePressPractice}
            onPressMaster={handleSelectMaster}
            title={title}
          />
        </View>
      </>
    )
  );
  CategorySection.displayName = 'CategorySection';

  // Define section item type
  interface SectionItem {
    id: string;
    type: string;
    title?: string;
    data?: FlashcardCategory[];
  }

  // Optimized renderItem function with memoization
  const renderItem = React.useCallback(
    ({ item }: { item: SectionItem }) => {
      switch (item.type) {
        case 'header':
          return <HeaderSection />;
        case 'category-subtitle':
          return <CategorySubtitleSection />;
        case 'stats-subtitle':
          return <StatsSubtitleSection />;
        case 'limit-info':
          return <LimitInfoSection />;
        case 'stats':
          return <StatsSection />;
        case 'category':
          return <CategorySection title={item.title} data={item.data} />;
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // No dependencies needed since components are memoized and stable
  );

  // Memoize keyExtractor
  const keyExtractor = React.useCallback((item: SectionItem) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  limitInfoContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  limitWarning: {
    marginTop: 4,
  },
});
