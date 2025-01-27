import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { useUserData } from "@stores/useUserStore";
import { useAlertDialog } from "@components/ui/AlertDialog";
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
  const router = useRouter();
  const userData = useUserData();
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const alertDialog = useAlertDialog();
  // Local state
  const [decks, setDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DeckCategory>(
    options?.initialCategory || "All"
  );
  const [deckRatings, setDeckRatings] = useState<Record<string, number>>({});

  // Cache
  const ratingsCache = useRef<DeckRatings>({});
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Error handling
  const handleError = useCallback(
    (error: any, message: string) => {
      console.error(message, error);
      setError(message);
      alertDialog.error(message);
      return null;
    },
    [setError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Auth check
  const checkAuth = useCallback(() => {
    if (!userData?.id) {
      alertDialog.error("Please login to continue");
      return false;
    }
    return true;
  }, [userData?.id]);

  // Load deck ratings from cache or API
  const loadDeckRatings = useCallback(async () => {
    if (!userData?.id) return;

    try {
      const now = Date.now();
      const cachedRatings = ratingsCache.current;

      // Check cache first
      const validRatings: Record<string, number> = {};
      let needsFetch = false;

      Object.entries(cachedRatings).forEach(
        ([deckId, { rating, timestamp }]) => {
          if (now - timestamp < CACHE_EXPIRY) {
            validRatings[deckId] = rating;
          } else {
            needsFetch = true;
          }
        }
      );

      if (needsFetch || Object.keys(validRatings).length === 0) {
        const freshRatings = await Promise.all(
          decks.map(async (deck) => {
            const rating = await deckService.getDeckRating(deck.id);
            return { deckId: deck.id, rating: rating as number };
          })
        );

        freshRatings.forEach(({ deckId, rating }) => {
          ratingsCache.current[deckId] = {
            rating,
            timestamp: now,
          };
          validRatings[deckId] = rating;
        });
      }

      setDeckRatings(validRatings);
    } catch (error) {
      handleError(error, "Failed to load deck ratings");
    }
  }, [decks, userData?.id, handleError]);

  // Fetch decks based on category and search query
  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      let fetchedDecks: Deck[] = [];

      if (selectedCategory === "My" && userData?.id) {
        fetchedDecks = await deckService.getUserDecks(userData.id);
      } else if (selectedCategory === "Top") {
        fetchedDecks = await deckService.getTopRatedDecks();
      } else {
        // Use getDecks with category (or undefined for "All")
        const category =
          selectedCategory === "All" ? undefined : selectedCategory;
        fetchedDecks = await deckService.getDecks(category);
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        fetchedDecks = fetchedDecks.filter(
          (deck) =>
            deck.title.toLowerCase().includes(query) ||
            deck.description.toLowerCase().includes(query)
        );
      }

      setDecks(fetchedDecks);
    } catch (error) {
      handleError(error, "Failed to fetch decks");
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    searchQuery,
    userData?.id,
    setLoading,
    clearError,
    handleError,
  ]);

  // Vote on a deck
  const voteDeck = useCallback(
    async (deckId: string, isUpvote: boolean) => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();

        await deckService.voteDeck(deckId, userData!.id, isUpvote);
        await loadDeckRatings();
        await fetchDecks();
      } catch (error) {
        handleError(error, "Failed to vote on deck");
      } finally {
        setLoading(false);
      }
    },
    [
      checkAuth,
      userData,
      setLoading,
      clearError,
      loadDeckRatings,
      fetchDecks,
      handleError,
    ]
  );

  // Create a new deck
  const createDeck = useCallback(
    async (title: string, description: string) => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();

        const newDeck: Omit<Deck, "id"> = {
          title,
          description,
          category: "Other",
          createdBy: userData!.id,
          createdByUsername: userData!.name || "Anonymous",
          createdAt: new Date(),
          tags: [],
          flashcardCount: 0,
        };

        await deckService.createDeck(newDeck);
        router.push("/decks/my");
      } catch (error) {
        handleError(error, "Failed to create deck");
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, userData, router, setLoading, clearError, handleError]
  );

  // Effects
  useEffect(() => {
    setSearchQuery("");
  }, [selectedCategory]);

  useEffect(() => {
    loadDeckRatings();
  }, [loadDeckRatings]);

  // Derived states
  const filteredDecks = useMemo(() => decks || [], [decks]);
  const isEmpty = useMemo(() => decks.length === 0, [decks]);
  const emptyMessage = useMemo(() => {
    if (searchQuery.trim()) return "No results found";
    if (selectedCategory === "My") return "You haven't created any decks yet";
    return "No decks found";
  }, [searchQuery, selectedCategory]);

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
