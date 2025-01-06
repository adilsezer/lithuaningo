import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SectionText, SectionTitle } from "@components/typography";
import { Deck } from "@src/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useDecks } from "@hooks/useDecks";

interface DeckCardProps {
  deck: Deck;
  onVote: (deckId: string, isUpvote: boolean) => void;
  onReport: (deckId: string) => void;
  onComment: (deckId: string) => void;
  onQuiz: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onVote,
  onReport,
  onComment,
  onQuiz,
}) => {
  const { colors } = useThemeStyles();
  const { getDeckRating } = useDecks();
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    const fetchRating = async () => {
      const deckRating = await getDeckRating(deck.id);
      setRating(deckRating);
    };
    fetchRating();
  }, [deck.id, getDeckRating]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <SectionTitle style={[styles.title, { color: colors.text }]}>
          {deck.title}
        </SectionTitle>
        <View style={[styles.tag, { backgroundColor: colors.success + "20" }]}>
          <SectionText style={[styles.tagText, { color: colors.success }]}>
            {deck.category}
          </SectionText>
        </View>
      </View>

      <Text
        style={[styles.description, { color: colors.cardText }]}
        numberOfLines={2}
      >
        {deck.description}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {deck.tags.map((tag, index) => (
          <View
            key={index}
            style={[
              styles.tagChip,
              { backgroundColor: colors.secondary + "20" },
            ]}
          >
            <Text style={[styles.tagChipText, { color: colors.secondary }]}>
              {tag}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.metaInfo}>
        <View style={styles.creator}>
          <FontAwesome5 name="user" size={12} color={colors.cardText} />
          <Text style={[styles.metaText, { color: colors.cardText }]}>
            {deck.createdBy}
          </Text>
        </View>
        <View style={styles.rating}>
          <FontAwesome5 name="star" size={12} color={colors.secondary} />
          <Text style={[styles.metaText, { color: colors.cardText }]}>
            {(rating * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {!deck.isPublic && (
        <View style={styles.privateTag}>
          <FontAwesome5 name="lock" size={12} color={colors.error} />
          <Text style={[styles.privateText, { color: colors.error }]}>
            Private
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.practiceButton,
            { backgroundColor: colors.success },
          ]}
          onPress={() => router.push(`/decks/${deck.id}`)}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Practice
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.quizButton,
            { backgroundColor: colors.tertiary },
          ]}
          onPress={() => onQuiz(deck.id)}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Quiz
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onVote(deck.id, true)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="thumbs-up" size={20} color={colors.cardText} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onVote(deck.id, false)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="thumbs-down" size={20} color={colors.cardText} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onComment(deck.id)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="comment" size={20} color={colors.cardText} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onReport(deck.id)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="flag" size={20} color={colors.cardText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    flex: 1,
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagChipText: {
    fontSize: 12,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  creator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  privateTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  privateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  practiceButton: {},
  quizButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  iconButton: {
    padding: 8,
  },
});
