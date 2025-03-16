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
  DeckFormData,
} from "@src/types";
import deckService from "@services/data/deckService";
import { DeckCategory } from "@src/types/DeckCategory";

interface UseDecksOptions {
  initialCategory?: DeckCategory;
  userId?: string;
  limit?: number;
}

/**
 * Hook for managing deck operations and state
 * @param deckIdOrOptions - Either a deck ID string or options object
 */
export const useDecks = (deckIdOrOptions?: string | UseDecksOptions) => {
  const router = useRouter();
  const userData = useUserData();
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const { showError, showSuccess, showConfirm } = useAlertDialog();
  const isAuthenticated = useIsAuthenticated();

  // Parse parameters
  const deckId =
    typeof deckIdOrOptions === "string" ? deckIdOrOptions : undefined;
  const options =
    typeof deckIdOrOptions === "object" ? deckIdOrOptions : undefined;

  // Local state
  const [decks, setDecks] = useState<(Deck | DeckWithRatingResponse)[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DeckCategory>(
    options?.initialCategory || "All Decks"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = options?.limit || 10;

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

  // Fetch a specific deck by ID
  const fetchDeck = useCallback(async () => {
    if (!deckId) return;

    setLoading(true);
    try {
      const fetchedDeck = await deckService.getDeck(deckId);
      setDeck(fetchedDeck);

      // Check if user is authorized to edit
      if (
        fetchedDeck &&
        userData?.id !== fetchedDeck.userId &&
        !userData?.isAdmin
      ) {
        showError("You are not authorized to edit this deck");
        router.back();
        return;
      }
    } catch (error) {
      console.error("[useDecks] Error fetching deck:", error);
      handleError(error, "Failed to load deck");
    } finally {
      setLoading(false);
    }
  }, [deckId, setLoading, userData, router, showError, handleError]);

  // Fetch decks based on category and search query
  const fetchDecks = useCallback(
    async (page: number = 1) => {
      if (!isAuthenticated) {
        setDecks([]);
        return;
      }

      try {
        setLoading(true);
        clearError();

        let fetchedDecks: (Deck | DeckWithRatingResponse)[] = [];

        // Use different endpoint based on category
        if (selectedCategory === "Top Rated") {
          // Continue using getTopRatedDecks for "Top Rated" category
          fetchedDecks = await deckService.getTopRatedDecks(pageSize, "all");
        } else {
          // Use getPublicDecks for all other categories
          fetchedDecks = await deckService.getPublicDecks(pageSize, page);
        }

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
          const query = searchQuery.toLowerCase();
          fetchedDecks = fetchedDecks.filter(
            (deck) =>
              deck.title.toLowerCase().includes(query) ||
              deck.description.toLowerCase().includes(query)
          );
        }

        setDecks(fetchedDecks);
        setCurrentPage(page);

        // Estimate total pages based on results
        // If we got fewer results than requested, we're on the last page
        // If we got exactly the number requested, there might be more
        if (fetchedDecks.length < pageSize) {
          setTotalPages(page);
        } else {
          // Assume there's at least one more page
          setTotalPages(page + 1);
        }
      } catch (error) {
        console.error("[useDecks] Error fetching decks:", error);
        handleError(error, "Failed to fetch decks");
      } finally {
        setLoading(false);
      }
    },
    [
      selectedCategory,
      searchQuery,
      userData?.id,
      setLoading,
      clearError,
      handleError,
      isAuthenticated,
      pageSize,
    ]
  );

  // Get a specific deck by ID
  const getDeckById = useCallback(
    async (id: string) => {
      try {
        const deck = await deckService.getDeck(id);
        return deck;
      } catch (error) {
        console.error("[useDecks] Error fetching deck by ID:", error);
        handleError(error, "Failed to fetch deck");
        return null;
      }
    },
    [handleError]
  );

  // Create a new deck
  const createDeck = useCallback(
    async (formData: DeckFormData, onSuccess?: () => void) => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        clearError();

        if (!formData.title || !formData.description) {
          throw new Error("Missing required fields");
        }

        // Convert form data to request format
        const request: CreateDeckRequest = {
          userId: userData?.id || "",
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags
            ? formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          isPublic: formData.isPublic ?? true,
        };

        const deck = await deckService.createDeck({
          request,
          imageFile: formData.imageFile || undefined,
        });

        showSuccess("Deck created! Add flashcards to help everyone learn");

        if (onSuccess) {
          onSuccess();
        }

        return deck.id;
      } catch (error) {
        console.error("[useDecks] Error creating deck:", error);
        handleError(error, "Failed to create deck");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, setLoading, clearError, handleError, showSuccess, userData?.id]
  );

  // Update an existing deck
  const updateDeck = useCallback(
    async (formData: DeckFormData, onSuccess?: () => void) => {
      if (!checkAuth() || !deckId || !deck) return false;

      try {
        setLoading(true);
        clearError();

        // Convert form data to request format
        const request: Omit<UpdateDeckRequest, "imageUrl"> = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags
            ? formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          isPublic: formData.isPublic ?? true,
        };

        await deckService.updateDeck(
          deckId,
          request,
          formData.imageFile || undefined
        );
        showSuccess("Deck updated successfully");

        if (onSuccess) {
          onSuccess();
        }

        return true;
      } catch (error) {
        console.error("[useDecks] Error updating deck:", error);
        handleError(error, "Failed to update deck");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth, setLoading, clearError, handleError, showSuccess, deckId, deck]
  );

  // Delete a deck
  const deleteDeck = useCallback(
    async (onSuccess?: () => void) => {
      if (!checkAuth() || !deckId) return false;

      showConfirm({
        title: "Delete Deck",
        message:
          "Are you sure you want to delete this deck? This action cannot be undone.",
        onConfirm: async () => {
          setLoading(true);
          try {
            await deckService.deleteDeck(deckId);
            showSuccess("Deck deleted successfully");

            if (onSuccess) {
              onSuccess();
            }

            // Don't return anything to match the expected void return type
          } catch (error) {
            console.error("[useDecks] Error deleting deck:", error);
            handleError(error, "Failed to delete deck");
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [
      checkAuth,
      setLoading,
      clearError,
      handleError,
      showSuccess,
      showConfirm,
      deckId,
    ]
  );

  // Effects
  useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, [selectedCategory]);

  // If deckId is provided, fetch the deck on mount
  useEffect(() => {
    if (deckId) {
      fetchDeck();
    }
  }, [deckId, fetchDeck]);

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
    // State
    decks: filteredDecks,
    deck,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    isEmpty,
    emptyMessage,
    isAuthenticated: !!userData?.id,
    currentPage,
    totalPages,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    clearError,
    fetchDecks,
    fetchDeck,
    createDeck,
    getDeckById,
    updateDeck,
    deleteDeck,
    setCurrentPage,
  };
};
