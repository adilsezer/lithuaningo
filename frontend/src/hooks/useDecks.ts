import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Deck, Flashcard } from "@src/types";
import deckService from "@services/data/deckService";
import { AlertDialog } from "@components/ui/AlertDialog";

export type ViewMode = "all" | "top" | "my";

interface DeckRatings {
  [deckId: string]: {
    rating: number;
    timestamp: number;
  };
}

export const useDecks = (currentUserId?: string) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  // Cache deck ratings with a 5-minute expiry
  const ratingsCache = useRef<DeckRatings>({});
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    AlertDialog.error(message);
    return null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchDecks = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      let data: Deck[] = [];

      if (searchQuery.trim()) {
        data = await deckService.searchDecks(searchQuery);
      } else if (viewMode === "top") {
        data = await deckService.getTopRatedDecks();
      } else if (viewMode === "my" && currentUserId) {
        data = await deckService.getUserDecks(currentUserId);
      } else {
        data = await deckService.getDecks(selectedCategory || undefined);
      }

      setDecks(data);
    } catch (error) {
      handleError(error, "Failed to load decks");
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    viewMode,
    selectedCategory,
    currentUserId,
    handleError,
    clearError,
  ]);

  const getDeckRating = useCallback(
    async (id: string) => {
      const now = Date.now();
      const cached = ratingsCache.current[id];

      if (cached && now - cached.timestamp < CACHE_EXPIRY) {
        return cached.rating;
      }

      try {
        const rating = await deckService.getDeckRating(id);
        ratingsCache.current[id] = { rating, timestamp: now };
        return rating;
      } catch (error) {
        handleError(error, "Error getting deck rating");
        return 0;
      }
    },
    [handleError]
  );

  const invalidateRatingCache = useCallback((deckId: string) => {
    delete ratingsCache.current[deckId];
  }, []);

  const voteDeck = useCallback(
    async (deckId: string, userId: string, isUpvote: boolean) => {
      if (!userId) {
        AlertDialog.error("Please login to vote");
        return;
      }
      try {
        await deckService.voteDeck(deckId, userId, isUpvote);
        invalidateRatingCache(deckId);
        await fetchDecks();
      } catch (error) {
        handleError(error, "Failed to vote");
      }
    },
    [fetchDecks, handleError, invalidateRatingCache]
  );

  const reportDeck = useCallback(
    async (deckId: string, userId: string) => {
      if (!userId) {
        AlertDialog.error("Please login to report");
        return;
      }
      AlertDialog.confirm({
        title: "Report Deck",
        message: "Are you sure you want to report this deck?",
        onConfirm: async () => {
          try {
            await deckService.reportDeck(
              deckId,
              userId,
              "Inappropriate content"
            );
            AlertDialog.success("Report submitted successfully");
          } catch (error) {
            handleError(error, "Failed to submit report");
          }
        },
      });
    },
    [handleError]
  );

  const fetchFlashcards = useCallback(
    async (deckId: string) => {
      try {
        setIsLoading(true);
        clearError();
        const data = await deckService.getDeckFlashcards(deckId);
        setFlashcards(data);
      } catch (error) {
        handleError(error, "Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, clearError]
  );

  // Derived states with memoization
  const filteredDecks = useMemo(() => {
    if (!decks) return [];
    return decks;
  }, [decks]);

  const isEmpty = useMemo(() => decks.length === 0, [decks]);

  const emptyMessage = useMemo(() => {
    if (searchQuery.trim()) return "No results found";
    if (viewMode === "my") return "You haven't created any decks yet";
    return "No decks found";
  }, [searchQuery, viewMode]);

  // Clear search when changing view mode
  useEffect(() => {
    setSearchQuery("");
  }, [viewMode]);

  return {
    // States
    decks: filteredDecks,
    flashcards,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    viewMode,
    isEmpty,
    emptyMessage,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    clearError,
    fetchDecks,
    voteDeck,
    reportDeck,
    getDeckRating,
    fetchFlashcards,
  };
};
