import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DeckCardProps } from "./deck.types";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

export const DeckCard = memo<DeckCardProps>(({ deck, rating, actions }) => {
  const { colors } = useThemeStyles();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {deck.title}
        </Text>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: colors.success + "20" },
          ]}
        >
          <Text style={[styles.categoryText, { color: colors.success }]}>
            {deck.category}
          </Text>
        </View>
      </View>

      {/* Content */}
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
            <Text style={[styles.tagText, { color: colors.secondary }]}>
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

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Practice"
          onPress={() => actions.onPractice(deck.id)}
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          width="auto"
        />
        <CustomButton
          title="Quiz"
          onPress={() => actions.onQuiz(deck.id)}
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          width="auto"
        />
      </View>

      {/* Interactions */}
      <View style={styles.interactions}>
        <TouchableOpacity
          onPress={() => actions.onVote(true)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="thumbs-up" size={20} color={colors.cardText} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => actions.onVote(false)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="thumbs-down" size={20} color={colors.cardText} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => actions.onComment(deck.id)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="comment" size={20} color={colors.cardText} />
        </TouchableOpacity>
        <TouchableOpacity onPress={actions.onReport} style={styles.iconButton}>
          <FontAwesome5 name="flag" size={20} color={colors.cardText} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

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
    fontWeight: "600",
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
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
  tagText: {
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 0,
    minWidth: 125,
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  interactions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  iconButton: {
    padding: 8,
  },
});
