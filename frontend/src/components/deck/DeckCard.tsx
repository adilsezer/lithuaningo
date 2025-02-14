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
import { Deck } from "@src/types";

export interface DeckActions {
  onVote: (isUpvote: boolean) => void;
  onReport: () => void;
  onComment: (deckId: string) => void;
  onQuiz: (deckId: string) => void;
  onPractice: (deckId: string) => void;
  onEdit: (deckId: string) => void;
}

export interface DeckCardProps {
  deck: Deck;
  rating: number;
  actions: DeckActions;
}

export const DeckCard = memo<DeckCardProps>(({ deck, rating, actions }) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginVertical: 8,
      }}
    >
      <Card.Title
        title={deck.title}
        titleVariant="titleLarge"
        subtitle={deck.category}
        style={{ paddingBottom: 0 }}
        titleStyle={{ color: theme.colors.onSurface }}
        subtitleStyle={{ color: theme.colors.onSurface }}
      />

      <Card.Content>
        <Text
          variant="bodyMedium"
          numberOfLines={2}
          style={{ marginBottom: 12 }}
        >
          {deck.description}
        </Text>

        {deck.tags.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
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
            marginBottom: 16,
          }}
        >
          <Avatar.Text
            label={deck.username[0]}
            size={24}
            style={{ marginRight: 8 }}
          />
          <Text variant="bodySmall" style={{ flex: 1 }}>
            By {deck.username}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton icon="cards-outline" size={16} style={{ margin: 0 }} />
            <Text variant="bodySmall" style={{ marginRight: 12 }}>
              {deck.flashcardCount} cards
            </Text>
            <IconButton
              icon="star-outline"
              size={16}
              style={{ margin: 0 }}
              iconColor={theme.colors.secondary}
            />
            <Text variant="bodySmall">{(rating * 100).toFixed(0)}%</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            mode="contained"
            onPress={() => actions.onPractice(deck.id)}
            style={{ flex: 1 }}
            contentStyle={{ height: 40 }}
            icon="lightbulb-outline"
            buttonColor={theme.colors.primary}
          >
            Practice
          </Button>
          <Button
            mode="contained"
            onPress={() => actions.onQuiz(deck.id)}
            style={{ flex: 1 }}
            contentStyle={{ height: 40 }}
            icon="lightbulb-outline"
            buttonColor={theme.colors.secondary}
          >
            Quiz
          </Button>
        </View>
      </Card.Content>

      <Card.Actions
        style={{
          justifyContent: "space-around",
          paddingTop: 4,
          marginTop: 20,
          alignSelf: "center",
        }}
      >
        <IconButton
          icon="thumb-up-outline"
          size={24}
          onPress={() => actions.onVote(true)}
          iconColor={theme.colors.primary}
          mode="outlined"
        />
        <IconButton
          icon="thumb-down-outline"
          size={24}
          onPress={() => actions.onVote(false)}
          iconColor={theme.colors.primary}
          mode="outlined"
        />
        <IconButton
          icon="comment-outline"
          size={24}
          onPress={() => actions.onComment(deck.id)}
          iconColor={theme.colors.primary}
          mode="outlined"
        />
        <IconButton
          icon="flag-outline"
          size={24}
          onPress={actions.onReport}
          iconColor={theme.colors.primary}
          mode="outlined"
        />
        <IconButton
          icon="pencil-outline"
          size={24}
          onPress={() => actions.onEdit(deck.id)}
          iconColor={theme.colors.primary}
          mode="outlined"
        />
      </Card.Actions>
    </Card>
  );
});
