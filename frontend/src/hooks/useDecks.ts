import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import { AlertDialog } from "@components/ui/AlertDialog";
import type { Deck } from "@src/types";
import deckService from "@services/data/deckService";
import { DeckCategory } from "@src/types/DeckCategory";

interface UseDecksOptions {
  initialCategory?: DeckCategory;
}

interface DeckRatings {
  [deckId: string]: {
    rating: number;
    timestamp: number;
  };
}

export const useDecks = (currentUserId?: string, options?: UseDecksOptions) => {
  // Redux state
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const isLoading = useAppSelector(selectIsLoading);

  // Local state
  const [decks, setDecks] = useState<Deck[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DeckCategory>(
    options?.initialCategory || "All"
  );
  const [deckRatings, setDeckRatings] = useState<Record<string, number>>({});

  // Cache
  const ratingsCache = useRef<DeckRatings>({});
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Error handling
  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    AlertDialog.error(message);
    return null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auth check
  const checkAuth = useCallback(() => {
    if (!userData?.id) {
      AlertDialog.error("Please login to continue");
      return false;
    }
    return true;
  }, [userData?.id]);

  // Data fetching
  const fetchDecks = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      clearError();
      let data: Deck[] = [];

      if (searchQuery.trim()) {
        data = await deckService.searchDecks(searchQuery);
      } else if (selectedCategory === "Top") {
        data = await deckService.getTopRatedDecks(1, "week");
      } else if (selectedCategory === "My" && currentUserId) {
        data = await deckService.getUserDecks(currentUserId);
      } else if (selectedCategory === "All") {
        data = await deckService.getDecks();
      } else {
        data = await deckService.getDecks(selectedCategory);
      }

      setDecks(data);
      return true;
    } catch (error) {
      handleError(error, "Failed to load decks");
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    searchQuery,
    selectedCategory,
    currentUserId,
    handleError,
    clearError,
    dispatch,
  ]);

  // Rating management
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

  const loadDeckRatings = useCallback(async () => {
    const ratings: Record<string, number> = {};
    for (const deck of decks) {
      ratings[deck.id] = await getDeckRating(deck.id);
    }
    setDeckRatings(ratings);
  }, [decks, getDeckRating]);

  // Deck actions
  const voteDeck = useCallback(
    async (deckId: string, userId: string, isUpvote: boolean) => {
      if (!checkAuth()) return;

      try {
        dispatch(setLoading(true));
        await deckService.voteDeck(deckId, userId, isUpvote);
        invalidateRatingCache(deckId);
        await fetchDecks();
        return true;
      } catch (error) {
        handleError(error, "Failed to vote");
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [fetchDecks, handleError, invalidateRatingCache, checkAuth, dispatch]
  );

  const createDeck = useCallback(
    async (data: Partial<Deck>) => {
      if (!checkAuth()) return;

      try {
        dispatch(setLoading(true));
        clearError();

        const newDeck: Omit<Deck, "id"> = {
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          createdBy: userData!.id,
          createdByUsername: userData!.name || "",
          createdAt: new Date().toISOString(),
          tags:
            typeof data.tags === "string"
              ? (data.tags as string)
                  .split(",")
                  .map((tag: string) => tag.trim())
              : (data.tags as string[]) || [],
          flashcardCount: 0,
        };

        const deckId = await deckService.createDeck(newDeck as Deck);
        AlertDialog.success(
          "Deck created successfully. Please add flashcards to your deck."
        );
        router.push(`/flashcards/new?deckId=${deckId}`);
        await fetchDecks();
        return true;
      } catch (error) {
        handleError(error, "Failed to create deck");
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [userData, router, fetchDecks, handleError, clearError, checkAuth, dispatch]
  );

  // Derived states
  const filteredDecks = useMemo(() => decks || [], [decks]);
  const isEmpty = useMemo(() => decks.length === 0, [decks]);
  const emptyMessage = useMemo(() => {
    if (searchQuery.trim()) return "No results found";
    if (selectedCategory === "My") return "You haven't created any decks yet";
    return "No decks found";
  }, [searchQuery, selectedCategory]);

  // Effects
  useEffect(() => {
    setSearchQuery("");
  }, [selectedCategory]);

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
    isEmpty,
    emptyMessage,
    deckRatings,
    isAuthenticated: !!userData?.id,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    clearError,
    fetchDecks,
    voteDeck,
    createDeck,
  };
};
