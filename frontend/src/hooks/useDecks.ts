import { useState, useCallback } from "react";
import { Deck, Flashcard } from "@src/types";
import deckService from "@services/data/deckService";

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

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

  const getTopRatedDecks = useCallback(async (limit?: number) => {
    try {
      setIsLoading(true);
      const data = await deckService.getTopRatedDecks(limit);
      setDecks(data);
    } catch (error) {
      console.error("Error fetching top rated decks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDeckFlashcards = useCallback(async (deckId: string) => {
    try {
      setIsLoading(true);
      const data = await deckService.getDeckFlashcards(deckId);
      setFlashcards(data);
      return data;
    } catch (error) {
      console.error("Error fetching deck flashcards:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFlashcardToDeck = useCallback(
    async (deckId: string, flashcard: Flashcard) => {
      try {
        const flashcardId = await deckService.addFlashcardToDeck(
          deckId,
          flashcard
        );
        await getDeckFlashcards(deckId);
        return flashcardId;
      } catch (error) {
        console.error("Error adding flashcard to deck:", error);
        return null;
      }
    },
    [getDeckFlashcards]
  );

  const removeFlashcardFromDeck = useCallback(
    async (deckId: string, flashcardId: string) => {
      try {
        await deckService.removeFlashcardFromDeck(deckId, flashcardId);
        await getDeckFlashcards(deckId);
      } catch (error) {
        console.error("Error removing flashcard from deck:", error);
      }
    },
    [getDeckFlashcards]
  );

  const getDeckRating = useCallback(async (id: string) => {
    try {
      return await deckService.getDeckRating(id);
    } catch (error) {
      console.error("Error getting deck rating:", error);
      return 0;
    }
  }, []);

  return {
    decks,
    flashcards,
    isLoading,
    fetchDecks,
    voteDeck,
    searchDecks,
    getTopRatedDecks,
    getDeckFlashcards,
    addFlashcardToDeck,
    removeFlashcardFromDeck,
    getDeckRating,
  };
};
