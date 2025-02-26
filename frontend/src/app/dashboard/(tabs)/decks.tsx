import React, { useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { DeckCard } from "@components/deck/DeckCard";
import { useDecks } from "@hooks/useDecks";
import { useUserData } from "@stores/useUserStore";
import { SearchBar } from "@components/ui/SearchBar";
import { useRouter } from "expo-router";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import CustomButton from "@components/ui/CustomButton";
import { DeckCategory, deckCategories } from "@src/types/DeckCategory";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { CustomPicker } from "@components/ui/CustomPicker";
import { useDeckVote } from "@src/hooks/useDeckVote";
import { Deck, DeckWithRatingResponse } from "@src/types";

// Separate component for DeckCard with votes
const DeckCardWithVotes: React.FC<{ deck: Deck | DeckWithRatingResponse }> = ({
  deck,
}) => {
  const router = useRouter();
  const userData = useUserData();
  const { voteDeck } = useDeckVote(deck.id);
  const { fetchDecks } = useDecks({ userId: userData?.id });

  const handleNavigation = useCallback(
    (route: string) => {
      if (!userData?.id) {
        return;
      }
      router.push(route);
    },
    [userData?.id, router]
  );

  const actions = {
    onVote: async (isUpvote: boolean) => {
      if (!userData?.id) return;
      const result = await voteDeck({
        deckId: deck.id,
        userId: userData.id,
        isUpvote,
      });
      if (result) {
        await fetchDecks();
      }
    },
    onReport: () => handleNavigation(`/decks/${deck.id}/report`),
    onComment: () => handleNavigation(`/decks/${deck.id}/comments`),
    onQuiz: () => handleNavigation(`/decks/${deck.id}/quiz`),
    onPractice: () => handleNavigation(`/decks/${deck.id}`),
    onEdit: () => handleNavigation(`/decks/${deck.id}/edit`),
  };

  return <DeckCard deck={deck} actions={actions} />;
};

export default function DecksScreen() {
  const userData = useUserData();
  const theme = useTheme();
  const router = useRouter();

  const {
    decks,
    error,
    searchQuery,
    selectedCategory,
    emptyMessage,
    isAuthenticated,
    setSearchQuery,
    setSelectedCategory,
    clearError,
    fetchDecks,
  } = useDecks({ userId: userData?.id });

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

  const renderHeader = useCallback(
    () => (
      <>
        <View>
          <CustomText variant="titleLarge" bold>
            Decks
          </CustomText>
          <CustomButton
            title="Add New Deck"
            onPress={() => handleNavigation("/decks/new")}
          />
        </View>
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search decks and flashcards..."
          initialValue={searchQuery}
        />
        <CustomPicker
          value={selectedCategory}
          onValueChange={(category) =>
            setSelectedCategory(category as DeckCategory)
          }
          options={deckCategories.map((category) => ({
            label: category,
            value: category,
          }))}
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={decks}
        renderItem={({ item }) => <DeckCardWithVotes deck={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <CustomText style={[styles.emptyText]}>{emptyMessage}</CustomText>
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
  list: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
});
