import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
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
import CustomButton from "@components/ui/CustomButton";

export default function DecksScreen() {
  const {
    decks,
    isLoading,
    fetchDecks,
    voteDeck,
    searchDecks,
    getTopRatedDecks,
  } = useDecks();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "top">("all");
  const userData = useAppSelector(selectUserData);
  const { colors } = useThemeStyles();
  const router = useRouter();

  useEffect(() => {
    loadDecks();
  }, [selectedCategory, searchQuery, viewMode]);

  const loadDecks = async () => {
    try {
      setError(null);
      if (searchQuery.trim()) {
        await searchDecks(searchQuery);
      } else if (viewMode === "top") {
        await getTopRatedDecks();
      } else {
        await fetchDecks(selectedCategory);
      }
    } catch (err) {
      setError("Failed to load decks. Please try again later.");
      console.error("Error loading decks:", err);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setViewMode("all");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setViewMode("all");
  };

  const handleVote = async (deckId: string, isUpvote: boolean) => {
    if (!userData) {
      AlertDialog.error("Please login to vote");
      return;
    }
    try {
      await voteDeck(deckId, userData.id, isUpvote);
    } catch (err) {
      AlertDialog.error("Failed to vote. Please try again later.");
      console.error("Error voting:", err);
    }
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

  const renderHeader = () => (
    <>
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
      <View style={styles.viewModeContainer}>
        <CustomButton
          title="All Decks"
          onPress={() => setViewMode("all")}
          style={[
            styles.viewModeButton,
            viewMode === "all" && { backgroundColor: colors.primary },
          ]}
        />
        <CustomButton
          title="Top Rated"
          onPress={() => setViewMode("top")}
          style={[
            styles.viewModeButton,
            viewMode === "top" && { backgroundColor: colors.primary },
          ]}
        />
      </View>
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.active} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <CustomButton title="Retry" onPress={loadDecks} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No decks found
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  viewModeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
  },
});
