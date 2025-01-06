import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDecks } from "@hooks/useDecks";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Flashcard } from "@src/types";
import { FontAwesome5 } from "@expo/vector-icons";
import CustomButton from "@components/ui/CustomButton";
import { AlertDialog } from "@components/ui/AlertDialog";
import { SectionTitle } from "@components/typography";

interface DeckFlashcardsProps {
  deckId: string;
  onAddFlashcard?: () => void;
}

export const DeckFlashcards: React.FC<DeckFlashcardsProps> = ({
  deckId,
  onAddFlashcard,
}) => {
  const { colors } = useThemeStyles();
  const { getDeckFlashcards, removeFlashcardFromDeck } = useDecks();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, [deckId]);

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDeckFlashcards(deckId);
      setFlashcards(data);
    } catch (err) {
      setError("Failed to load flashcards. Please try again.");
      console.error("Error loading flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlashcard = (flashcardId: string) => {
    AlertDialog.confirm({
      title: "Delete Flashcard",
      message: "Are you sure you want to delete this flashcard?",
      onConfirm: async () => {
        try {
          await removeFlashcardFromDeck(deckId, flashcardId);
          await loadFlashcards();
          AlertDialog.success("Flashcard deleted successfully");
        } catch (err) {
          AlertDialog.error("Failed to delete flashcard");
          console.error("Error deleting flashcard:", err);
        }
      },
    });
  };

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <View style={[styles.flashcardItem, { backgroundColor: colors.card }]}>
      <View style={styles.flashcardContent}>
        <Text style={[styles.flashcardText, { color: colors.text }]}>
          {item.front}
        </Text>
        <Text style={[styles.flashcardSubtext, { color: colors.cardText }]}>
          {item.back}
        </Text>
        {item.exampleSentence && (
          <Text style={[styles.exampleText, { color: colors.cardText }]}>
            Example: {item.exampleSentence}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => item.id && handleDeleteFlashcard(item.id)}
        style={styles.deleteButton}
      >
        <FontAwesome5 name="trash" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.active} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <CustomButton title="Retry" onPress={loadFlashcards} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionTitle>Flashcards</SectionTitle>
        {onAddFlashcard && (
          <CustomButton
            title="Add Flashcard"
            onPress={onAddFlashcard}
            style={styles.addButton}
          />
        )}
      </View>
      <FlatList
        data={flashcards}
        renderItem={renderFlashcard}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No flashcards found
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  addButton: {
    minWidth: 120,
  },
  list: {
    padding: 16,
  },
  flashcardItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flashcardContent: {
    flex: 1,
  },
  flashcardText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  flashcardSubtext: {
    fontSize: 14,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 8,
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
});
