import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
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

export default function DecksScreen() {
  const userData = useAppSelector(selectUserData);
  const { colors } = useThemeStyles();
  const router = useRouter();
  const [deckRatings, setDeckRatings] = useState<Record<string, number>>({});

  const {
    decks,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    viewMode,
    isEmpty,
    emptyMessage,
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    fetchDecks,
    voteDeck,
    reportDeck,
    getDeckRating,
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
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    searchBar: {
      marginBottom: 16,
    },

    viewModeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 16,
    },
    viewModeButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    activeViewModeButton: {
      backgroundColor: colors.primary,
    },
    viewModeText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.secondary,
    },
    activeViewModeText: {
      color: colors.background,
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

  useEffect(() => {
    const loadRatings = async () => {
      const ratings: Record<string, number> = {};
      for (const deck of decks) {
        ratings[deck.id] = await getDeckRating(deck.id);
      }
      setDeckRatings(ratings);
    };
    loadRatings();
  }, [decks, getDeckRating]);

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
      <View style={styles.headerContainer}>
        <SectionTitle>Decks</SectionTitle>
      </View>
      <SearchBar
        onSearch={setSearchQuery}
        placeholder="Search decks and flashcards..."
        style={styles.searchBar}
        initialValue={searchQuery}
      />
      <CategoryPicker
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          onPress={() => setViewMode("all")}
          style={[
            styles.viewModeButton,
            viewMode === "all" && styles.activeViewModeButton,
          ]}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === "all" && styles.activeViewModeText,
            ]}
          >
            All Decks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode("top")}
          style={[
            styles.viewModeButton,
            viewMode === "top" && styles.activeViewModeButton,
          ]}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === "top" && styles.activeViewModeText,
            ]}
          >
            Top Rated
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode("my")}
          style={[
            styles.viewModeButton,
            viewMode === "my" && styles.activeViewModeButton,
          ]}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === "my" && styles.activeViewModeText,
            ]}
          >
            My Decks
          </Text>
        </TouchableOpacity>
      </View>
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
            colors={colors}
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
