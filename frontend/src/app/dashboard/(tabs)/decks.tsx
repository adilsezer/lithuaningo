import React, { useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { SectionTitle } from "@components/typography";
import { DeckCard } from "@components/deck/DeckCard";
import { useDecks } from "@hooks/useDecks";
import { useUserStore } from "@stores/useUserStore";
import { useUserData } from "@stores/useUserStore";
import { CustomCategoryPicker } from "@components/ui/CustomCategoryPicker";
import { SearchBar } from "@components/ui/SearchBar";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useRouter } from "expo-router";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import CustomButton from "@components/ui/CustomButton";
import { DeckCategory } from "@src/types/DeckCategory";

export default function DecksScreen() {
  const userData = useUserData();
  const { colors } = useThemeStyles();
  const router = useRouter();

  const {
    decks,
    error,
    searchQuery,
    selectedCategory,
    emptyMessage,
    deckRatings,
    isAuthenticated,
    setSearchQuery,
    setSelectedCategory,
    clearError,
    fetchDecks,
    voteDeck,
  } = useDecks(userData?.id);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleNavigation = useCallback(
    (route: string) => {
      if (!isAuthenticated) {
        return;
      }
      router.push(route);
    },
    [isAuthenticated, router]
  );

  const handleDeckActions = useCallback(
    (deckId: string) => ({
      onVote: (isUpvote: boolean) => voteDeck(deckId, isUpvote),
      onReport: () => handleNavigation(`/decks/${deckId}/report`),
      onComment: () => handleNavigation(`/decks/${deckId}/comments`),
      onQuiz: () => handleNavigation(`/decks/${deckId}/quiz`),
      onPractice: () => handleNavigation(`/decks/${deckId}`),
    }),
    [voteDeck, handleNavigation]
  );

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <SectionTitle>Decks</SectionTitle>
          </View>
          <CustomButton
            title="Add New Deck"
            onPress={() => handleNavigation("/decks/new")}
            variant="primary"
          />
        </View>
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search decks and flashcards..."
          initialValue={searchQuery}
        />
        <CustomCategoryPicker
          selectedCategory={selectedCategory}
          onSelectCategory={(category: DeckCategory) =>
            setSelectedCategory(category)
          }
        />
      </>
    ),
    [
      searchQuery,
      selectedCategory,
      setSearchQuery,
      setSelectedCategory,
      handleNavigation,
    ]
  );

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={useCallback(() => {
          clearError();
          fetchDecks();
        }, [clearError, fetchDecks])}
        fullScreen
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={decks}
        renderItem={({ item }) => (
          <DeckCard
            deck={item}
            rating={deckRatings[item.id] || 0}
            actions={handleDeckActions(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {emptyMessage}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
});
