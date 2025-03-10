import React, { memo } from "react";
import { View } from "react-native";
import {
  Card,
  Text,
  Chip,
  Button,
  IconButton,
  Avatar,
  useTheme,
} from "react-native-paper";
import { Deck, DeckWithRatingResponse, isDeckWithRating } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import { formatRelative } from "@utils/dateUtils";

export interface DeckActions {
  onVote: (isUpvote: boolean) => void;
  onReport: () => void;
  onComment: (deckId: string) => void;
  onPractice: (deckId: string) => void;
  onChallenge: (deckId: string) => void;
  onEdit: (deckId: string) => void;
}

export interface DeckCardProps {
  deck: Deck | DeckWithRatingResponse;
  actions: DeckActions;
}

export const DeckCard = memo<DeckCardProps>(({ deck, actions }) => {
  const theme = useTheme();
  const userData = useUserData();

  // Check if user can edit (is owner or admin)
  const canEdit = userData?.id === deck.userId || userData?.isAdmin === true;

  // Get rating information if available
  const hasRating = isDeckWithRating(deck);
  const rating = hasRating ? deck.rating : 0;
  const totalVotes = hasRating ? deck.totalVotes : 0;
  const upvoteCount = hasRating ? deck.upvoteCount : 0;
  const downvoteCount = totalVotes - upvoteCount;

  const ratingDisplay =
    totalVotes > 0
      ? `${(rating * 100).toFixed(0)}% (${upvoteCount}/${
          upvoteCount + downvoteCount
        })`
      : "No ratings";

  return (
    <Card
      style={{
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginVertical: 8,
        borderRadius: 16,
      }}
    >
      <View style={{ overflow: "hidden", borderRadius: 16 }}>
        {deck.imageUrl && (
          <Card.Cover
            source={{ uri: deck.imageUrl }}
            style={{
              height: 160,
            }}
          />
        )}

        <Card.Content style={{ paddingVertical: 16 }}>
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Avatar.Text
                label={deck.username[0]}
                size={40}
                style={{
                  backgroundColor: theme.colors.primary,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  variant="titleLarge"
                  style={{ color: theme.colors.onSurface, marginBottom: 2 }}
                >
                  {deck.title}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  By {deck.username} • {deck.category}
                </Text>
              </View>
            </View>

            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: 12,
              }}
              numberOfLines={2}
            >
              {deck.description}
            </Text>

            {deck.tags.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {deck.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    compact
                    mode="flat"
                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                  >
                    <Text style={{ color: theme.colors.onSecondaryContainer }}>
                      {tag}
                    </Text>
                  </Chip>
                ))}
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  📑 {deck.flashcardsCount} cards
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  ⭐️ {ratingDisplay}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                mode="contained"
                onPress={() => actions.onPractice(deck.id)}
                style={{ flex: 1 }}
                contentStyle={{ height: 44, borderRadius: 22 }}
                icon="school"
                buttonColor={theme.colors.primary}
              >
                Practice
              </Button>
              <Button
                mode="contained"
                onPress={() => actions.onChallenge(deck.id)}
                style={{ flex: 1 }}
                contentStyle={{ height: 44, borderRadius: 22 }}
                icon="brain"
                buttonColor={theme.colors.secondary}
              >
                Challenge
              </Button>
            </View>
          </View>

          <View
            style={{
              height: 0.5,
              backgroundColor: theme.colors.outlineVariant,
              marginBottom: 8,
              opacity: 0.3,
            }}
          />

          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              opacity: 0.6,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Updated {formatRelative(deck.updatedAt)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <IconButton
              icon="thumb-up-outline"
              size={24}
              onPress={() => actions.onVote(true)}
              iconColor={theme.colors.primary}
            />
            <IconButton
              icon="thumb-down-outline"
              size={24}
              onPress={() => actions.onVote(false)}
              iconColor={theme.colors.primary}
            />
            <IconButton
              icon="comment-outline"
              size={24}
              onPress={() => actions.onComment(deck.id)}
              iconColor={theme.colors.primary}
            />
            <IconButton
              icon="flag-outline"
              size={24}
              onPress={actions.onReport}
              iconColor={theme.colors.primary}
            />
            {canEdit && (
              <IconButton
                icon="pencil-outline"
                size={24}
                onPress={() => actions.onEdit(deck.id)}
                iconColor={theme.colors.primary}
              />
            )}
          </View>
        </Card.Content>
      </View>
    </Card>
  );
});
