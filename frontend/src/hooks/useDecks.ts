import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { useUserData } from "@stores/useUserStore";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type { Deck, CreateDeckRequest, UpdateDeckRequest } from "@src/types";
import deckService from "@services/data/deckService";
import { DeckCategory } from "@src/types/DeckCategory";

interface UseDecksOptions {
  initialCategory?: DeckCategory;
}

export const useDecks = (currentUserId?: string, options?: UseDecksOptions) => {
  const router = useRouter();
  const userData = useUserData();
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const { showError } = useAlertDialog();
  // Local state
  const [decks, setDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DeckCategory>(
    options?.initialCategory || "All Decks"
  );

  // Error handling
  const handleError = useCallback(
    (error: any, message: string) => {
      console.error(message, error);
      setError(message);
      showError(message);
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
      showError("Please login to continue");
      return false;
    }
    return true;
  }, [userData?.id]);

  // Fetch decks based on category and search query
  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      let fetchedDecks: Deck[] = [];

      if (selectedCategory === "My Decks" && userData?.id) {
        fetchedDecks = await deckService.getUserDecks(userData.id);
      } else if (selectedCategory === "Top Rated") {
        fetchedDecks = await deckService.getTopRatedDecks();
      } else {
        // Use getDecks with category (or undefined for "All")
        const category =
          selectedCategory === "All Decks" ? undefined : selectedCategory;
        fetchedDecks = await deckService.getPublicDecks();
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

  // Create a new deck
  const createDeck = useCallback(
    async (title: string, description: string, category: string = "Other") => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();

        const request: CreateDeckRequest = {
          userId: userData!.id,
          title,
          description,
          category,
          tags: [],
          isPublic: true,
        };

        const deck = await deckService.createDeck(request);
        return deck.id;
      } catch (error) {
        handleError(error, "Failed to create deck");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, userData, setLoading, clearError, handleError]
  );

  const getDeckById = useCallback(
    async (id: string) => {
      try {
        const deck = await deckService.getDeck(id);
        return deck;
      } catch (error) {
        handleError(error, "Failed to fetch deck");
        return null;
      }
    },
    [handleError]
  );

  const updateDeck = useCallback(
    async (id: string, deck: Partial<Deck>) => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();

        const request: UpdateDeckRequest = {
          title: deck.title || "",
          description: deck.description || "",
          category: deck.category || "Other",
          tags: deck.tags || [],
          isPublic: deck.isPublic ?? true,
          imageUrl: deck.imageUrl,
        };

        await deckService.updateDeck(id, request);
      } catch (error) {
        handleError(error, "Failed to update deck");
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, setLoading, clearError, handleError]
  );

  // Effects
  useEffect(() => {
    setSearchQuery("");
  }, [selectedCategory]);

  // Derived states
  const filteredDecks = useMemo(() => decks || [], [decks]);
  const isEmpty = useMemo(() => decks.length === 0, [decks]);
  const emptyMessage = useMemo(() => {
    if (searchQuery.trim()) return "No results found";
    if (selectedCategory === "My Decks")
      return "You haven't created any decks yet";
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
    isAuthenticated: !!userData?.id,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    clearError,
    fetchDecks,
    createDeck,
    getDeckById,
    updateDeck,
  };
};
