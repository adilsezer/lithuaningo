import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import { AlertDialog } from "@components/ui/AlertDialog";
import type { Deck } from "@src/types";
import deckService from "@services/data/deckService";

export type ViewMode = "all" | "top" | "my";

interface DeckRatings {
  [deckId: string]: {
    rating: number;
    timestamp: number;
  };
}

export const useDecks = (currentUserId?: string) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const isLoading = useAppSelector(selectIsLoading);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [deckRatings, setDeckRatings] = useState<Record<string, number>>({});

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
      dispatch(setLoading(true));
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
      dispatch(setLoading(false));
    }
  }, [
    searchQuery,
    viewMode,
    selectedCategory,
    currentUserId,
    handleError,
    clearError,
    dispatch,
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

  const createDeck = async (data: Partial<Deck>) => {
    try {
      if (!userData?.id) {
        AlertDialog.error("Please login to create decks");
        return;
      }

      const newDeck: Omit<Deck, "id"> = {
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        createdBy: userData.id,
        createdByUsername: userData.name || "",
        createdAt: new Date().toISOString(),
        tags:
          typeof data.tags === "string"
            ? (data.tags as string).split(",").map((tag: string) => tag.trim())
            : (data.tags as string[]) || [],
      };

      const deckId = await deckService.createDeck(newDeck as Deck);
      AlertDialog.success(
        "Deck created successfully. Please add flashcards to your deck."
      );
      router.push(`/flashcards/new?deckId=${deckId}`);
      await fetchDecks(); // Refresh the decks list
    } catch (error) {
      handleError(error, "Failed to create deck");
    }
  };

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

  const loadDeckRatings = useCallback(async () => {
    const ratings: Record<string, number> = {};
    for (const deck of decks) {
      ratings[deck.id] = await getDeckRating(deck.id);
    }
    setDeckRatings(ratings);
  }, [decks, getDeckRating]);

  // Add useEffect to load ratings when decks change
  useEffect(() => {
    loadDeckRatings();
  }, [loadDeckRatings]);

  return {
    // States
    decks: filteredDecks,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    viewMode,
    isEmpty,
    emptyMessage,
    deckRatings,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    clearError,
    fetchDecks,
    voteDeck,
    reportDeck,
    getDeckRating,
    createDeck,
    isAuthenticated: !!userData?.id,
  };
};
