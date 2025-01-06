import { useState, useCallback } from "react";
import { Deck } from "@src/types";
import deckService from "@services/data/deckService";

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDecks = useCallback(async (category?: string) => {
    try {
      setIsLoading(true);
      const data = await deckService.getDecks(category);
      setDecks(data);
    } catch (error) {
      console.error("Error fetching decks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const voteDeck = useCallback(
    async (deckId: string, userId: string, isUpvote: boolean) => {
      try {
        await deckService.voteDeck(deckId, userId, isUpvote);
        await fetchDecks(); // Refresh decks after voting
      } catch (error) {
        console.error("Error voting deck:", error);
      }
    },
    [fetchDecks]
  );

  const searchDecks = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const data = await deckService.searchDecks(query);
      setDecks(data);
    } catch (error) {
      console.error("Error searching decks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    decks,
    isLoading,
    fetchDecks,
    voteDeck,
    searchDecks,
  };
};
