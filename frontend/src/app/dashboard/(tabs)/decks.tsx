import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { SectionTitle } from "@components/typography";
import { DeckCard } from "@components/deck/DeckCard";
import { useDecks } from "@hooks/useDecks";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { CategoryPicker } from "@components/ui/CategoryPicker";
import { SearchBar } from "@components/ui/SearchBar";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useRouter } from "expo-router";
import { AlertDialog } from "@components/ui/AlertDialog";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import CustomButton from "@components/ui/CustomButton";

export default function DecksScreen() {
  const userData = useAppSelector(selectUserData);
  const { colors } = useThemeStyles();
  const router = useRouter();

  const {
    decks,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    viewMode,
    emptyMessage,
    deckRatings,
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    fetchDecks,
    voteDeck,
    reportDeck,
  } = useDecks(userData?.id);

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

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleComment = (deckId: string) => {
    if (!userData) {
      AlertDialog.error("Please login to comment");
      return;
    }
    router.push(`/decks/${deckId}/comments`);
  };

  const handleQuiz = (deckId: string) => {
    if (!userData) {
      AlertDialog.error("Please login to take quiz");
      return;
    }
    router.push(`/decks/${deckId}/quiz`);
  };

  const handleAddFlashcard = () => {
    if (!userData) {
      AlertDialog.error("Please login to add flashcards");
      return;
    }
    router.push("/decks/new");
  };

  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <SectionTitle>Decks</SectionTitle>
        </View>
        <CustomButton
          title="Add New Deck"
          onPress={handleAddFlashcard}
          variant="primary"
        />
      </View>
      <SearchBar
        onSearch={setSearchQuery}
        placeholder="Search decks and flashcards..."
        initialValue={searchQuery}
      />
      <CategoryPicker
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </>
  );

  if (isLoading) {
    return <LoadingIndicator modal={false} style={styles.loadingContainer} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDecks} fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={decks}
        renderItem={({ item }) => (
          <DeckCard
            deck={item}
            rating={deckRatings[item.id] || 0}
            actions={{
              onVote: (isUpvote) =>
                userData?.id && voteDeck(item.id, userData.id, isUpvote),
              onReport: () => userData?.id && reportDeck(item.id, userData.id),
              onComment: handleComment,
              onQuiz: handleQuiz,
              onPractice: (deckId) => router.push(`/decks/${deckId}`),
            }}
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
