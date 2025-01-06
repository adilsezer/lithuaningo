import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SectionTitle } from "@components/typography";
import { DeckCard } from "@components/deck/DeckCard";
import { useDecks } from "@hooks/useDecks";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { AlertDialog } from "@components/ui/AlertDialog";
import { CategoryPicker } from "@components/ui/CategoryPicker";
import { SearchBar } from "@components/ui/SearchBar";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useRouter } from "expo-router";

export default function DecksScreen() {
  const { decks, isLoading, fetchDecks, voteDeck, searchDecks } = useDecks();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const userData = useAppSelector(selectUserData);
  const { colors } = useThemeStyles();
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim()) {
      searchDecks(searchQuery);
    } else {
      fetchDecks(selectedCategory);
    }
  }, [selectedCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleVote = async (deckId: string, isUpvote: boolean) => {
    if (!userData) {
      AlertDialog.error("Please login to vote");
      return;
    }
    await voteDeck(deckId, userData.id, isUpvote);
  };

  const handleReport = (deckId: string) => {
    if (!userData) {
      AlertDialog.error("Please login to report");
      return;
    }
    AlertDialog.confirm({
      title: "Report Deck",
      message: "Are you sure you want to report this deck?",
      onConfirm: () => {
        AlertDialog.success("Report submitted");
      },
    });
  };

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.active} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionTitle>Decks</SectionTitle>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search decks..."
        style={styles.searchBar}
        initialValue={searchQuery}
      />
      <CategoryPicker
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />
      <FlatList
        data={decks}
        renderItem={({ item }) => (
          <DeckCard
            deck={item}
            onVote={handleVote}
            onReport={handleReport}
            onComment={handleComment}
            onQuiz={handleQuiz}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: "center",
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
});
