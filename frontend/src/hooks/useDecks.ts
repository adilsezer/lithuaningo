import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { useIsAuthenticated } from "@stores/useUserStore";
import { useUserData } from "@stores/useUserStore";
import { useAlertDialog } from "@hooks/useAlertDialog";
import type {
  Deck,
  DeckWithRatingResponse,
  CreateDeckRequest,
  UpdateDeckRequest,
  ImageFile,
} from "@src/types";
import deckService from "@services/data/deckService";
import { DeckCategory } from "@src/types/DeckCategory";

interface UseDecksOptions {
  initialCategory?: DeckCategory;
  userId?: string;
}

export const useDecks = (options?: UseDecksOptions) => {
  const router = useRouter();
  const userData = useUserData();
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const { showError, showSuccess } = useAlertDialog();
  const isAuthenticated = useIsAuthenticated();

  // Local state
  const [decks, setDecks] = useState<(Deck | DeckWithRatingResponse)[]>([]);
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
    [setError, showError]
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
  }, [userData?.id, showError]);

  // Fetch decks based on category and search query
  const fetchDecks = useCallback(async () => {
    if (!isAuthenticated) {
      setDecks([]);
      return;
    }

    try {
      console.log("[useDecks] Starting to fetch decks", {
        selectedCategory,
        searchQuery,
      });
      setLoading(true);
      clearError();

      let fetchedDecks: (Deck | DeckWithRatingResponse)[] = [];

      // All categories now use getTopRatedDecks with timeRange: "all"
      console.log("[useDecks] Fetching decks for category:", selectedCategory);
      fetchedDecks = await deckService.getTopRatedDecks(10, "all");

      // Filter by category if needed
      if (
        selectedCategory !== "All Decks" &&
        selectedCategory !== "Top Rated"
      ) {
        if (selectedCategory === "My Decks") {
          fetchedDecks = fetchedDecks.filter(
            (deck) => deck.userId === userData?.id
          );
        } else {
          fetchedDecks = fetchedDecks.filter(
            (deck) => deck.category === selectedCategory
          );
        }
      }

      // Filter by search query if present
      if (searchQuery.trim()) {
        console.log("[useDecks] Filtering by search query:", searchQuery);
        const query = searchQuery.toLowerCase();
        fetchedDecks = fetchedDecks.filter(
          (deck) =>
            deck.title.toLowerCase().includes(query) ||
            deck.description.toLowerCase().includes(query)
        );
      }

      console.log("[useDecks] Setting final decks:", fetchedDecks);
      setDecks(fetchedDecks);
    } catch (error) {
      console.error("[useDecks] Error fetching decks:", error);
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
    isAuthenticated,
  ]);

  // Create a new deck
  const createDeck = useCallback(
    async (request: CreateDeckRequest, imageFile?: ImageFile) => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();

        if (!request.title || !request.description) {
          throw new Error("Missing required fields");
        }

        const deck = await deckService.createDeck({ request, imageFile });
        showSuccess("Deck created! Add flashcards to help everyone learn");
        return deck.id;
      } catch (error) {
        handleError(error, "Failed to create deck");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, setLoading, clearError, handleError, showSuccess]
  );

  const getDeckById = useCallback(
    async (id: string) => {
      try {
        return await deckService.getDeck(id);
      } catch (error) {
        handleError(error, "Failed to fetch deck");
        return null;
      }
    },
    [handleError]
  );

  const updateDeck = useCallback(
    async (
      id: string,
      deck: Omit<UpdateDeckRequest, "imageUrl">,
      imageFile?: ImageFile
    ) => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();
        await deckService.updateDeck(id, deck, imageFile);
      } catch (error) {
        handleError(error, "Failed to update deck");
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, setLoading, clearError, handleError]
  );

  const deleteDeck = useCallback(
    async (id: string) => {
      if (!checkAuth()) return false;

      try {
        setLoading(true);
        clearError();
        await deckService.deleteDeck(id);
        showSuccess("Deck deleted successfully");
        return true;
      } catch (error) {
        handleError(error, "Failed to delete deck");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, setLoading, clearError, handleError, showSuccess]
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
    decks: filteredDecks,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    isEmpty,
    emptyMessage,
    isAuthenticated: !!userData?.id,
    setSearchQuery,
    setSelectedCategory,
    clearError,
    fetchDecks,
    createDeck,
    getDeckById,
    updateDeck,
    deleteDeck,
  };
};
