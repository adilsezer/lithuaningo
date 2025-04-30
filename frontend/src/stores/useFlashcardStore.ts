import { create } from "zustand";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";
import flashcardService from "@services/data/flashcardService";
import {
  FlashcardResponse,
  FlashcardRequest,
  FlashcardCategory,
  DifficultyLevel,
} from "@src/types/Flashcard";
import {
  UserFlashcardStatResponse,
  UserFlashcardStatsSummaryResponse,
  SubmitFlashcardAnswerRequest,
} from "@src/types/UserFlashcardStats";
import { useUserStore } from "./useUserStore";

// Constants
export const DAILY_FLASHCARD_LIMIT = 25;

// Types
export interface FlashcardMessage {
  text: string;
  type: "success" | "error" | "info";
}

// Store state organized by domain
interface FlashcardState {
  flashcards: FlashcardResponse[];
  currentIndex: number;
  currentFlashcardId: string | null;
  flipped: boolean;
  isDeckCompleted: boolean;
}

interface StatsState {
  flashcardsAnsweredToday: number;
  lastSyncTime: Date | null;
  statsSummary: UserFlashcardStatsSummaryResponse | null;
  currentFlashcardStats: UserFlashcardStatResponse | null;
}

interface UIState {
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingFlashcards: boolean;
  error: string | null;
  submissionMessage: FlashcardMessage | null;
}

// Combined store interface
interface FlashcardStoreState extends FlashcardState, StatsState, UIState {
  // Flashcard actions
  fetchFlashcards: (params: {
    categoryId: string;
    userId?: string;
    isPremium: boolean;
  }) => Promise<void>;
  handleFlip: () => void;
  goToNextCard: () => void;
  resetSession: () => void;

  // Stats actions
  syncFlashcardCount: (userId?: string) => Promise<void>;
  incrementFlashcardCount: () => void;
  resetFlashcardCount: () => void;
  fetchFlashcardStats: (flashcardId: string, userId?: string) => Promise<void>;
  submitFlashcardAnswer: (
    answer: SubmitFlashcardAnswerRequest & { userId?: string }
  ) => Promise<void>;

  // Helper functions
  isDailyLimitReached: (isPremium: boolean) => boolean;
  canFetchNewCards: (isPremium: boolean) => boolean;
}

export const useFlashcardStore = create<FlashcardStoreState>((set, get) => ({
  // ===== INITIAL STATE =====

  // Flashcard state
  flashcards: [],
  currentIndex: 0,
  currentFlashcardId: null,
  flipped: false,
  isDeckCompleted: false,

  // Stats state
  flashcardsAnsweredToday: 0,
  lastSyncTime: null,
  statsSummary: null,
  currentFlashcardStats: null,

  // UI state
  isLoading: false,
  isLoadingStats: false,
  isLoadingFlashcards: false,
  error: null,
  submissionMessage: null,

  // ===== FLASHCARD ACTIONS =====

  fetchFlashcards: async ({ categoryId, userId, isPremium }) => {
    // Skip if daily limit reached for non-premium users
    if (!isPremium && get().flashcardsAnsweredToday >= DAILY_FLASHCARD_LIMIT) {
      // Set explicit message when trying to fetch with limit reached
      set({
        isDeckCompleted: true,
        submissionMessage: {
          text: "Daily flashcard limit reached. Upgrade to premium for unlimited access!",
          type: "error",
        },
      });
      return;
    }

    set({
      isLoadingFlashcards: true,
      error: null,
      isDeckCompleted: false,
      currentFlashcardId: null,
    });

    try {
      const numericId = parseInt(categoryId);
      const request: FlashcardRequest = {
        count: 10,
        userId,
        // Default values
        primaryCategory: FlashcardCategory.AllCategories,
        difficulty: DifficultyLevel.Basic,
      };

      // Set category or difficulty based on ID
      if (numericId >= 0 && numericId <= 2) {
        // It's a difficulty level
        request.difficulty = numericId as DifficultyLevel;
      } else {
        // It's a category
        request.primaryCategory = numericId as FlashcardCategory;
      }

      const flashcards = await flashcardService.getFlashcards(request);

      set({
        flashcards,
        currentIndex: 0,
        isDeckCompleted: flashcards.length === 0,
        isLoadingFlashcards: false,
        currentFlashcardId: flashcards.length > 0 ? flashcards[0].id : null,
      });

      // Fetch stats for first flashcard if available
      if (flashcards.length > 0 && userId) {
        get().fetchFlashcardStats(flashcards[0].id, userId);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load flashcards";

      set({
        isLoadingFlashcards: false,
        error: errorMessage,
        flashcards: [],
      });
    }
  },

  handleFlip: () => set((state) => ({ flipped: !state.flipped })),

  goToNextCard: () => {
    const { currentIndex, flashcards } = get();

    // Check if we've reached the end of the deck
    if (currentIndex >= flashcards.length - 1) {
      set({
        isDeckCompleted: true,
        submissionMessage: {
          text: "You've completed all cards in this deck!",
          type: "info",
        },
      });
      return;
    }

    // Move to next card
    const nextIndex = currentIndex + 1;
    const nextFlashcard = flashcards[nextIndex];

    set({
      currentIndex: nextIndex,
      currentFlashcardId: nextFlashcard.id,
      flipped: false,
      submissionMessage: null,
      currentFlashcardStats: null,
    });

    // Fetch stats for the new card
    const userId = get().statsSummary?.userId;
    if (userId) {
      get().fetchFlashcardStats(nextFlashcard.id, userId);
    }
  },

  resetSession: () => {
    set({
      flashcards: [],
      currentIndex: 0,
      currentFlashcardId: null,
      currentFlashcardStats: null,
      isDeckCompleted: false,
      flipped: false,
      error: null,
      submissionMessage: null,
    });
  },

  // ===== STATS ACTIONS =====

  syncFlashcardCount: async (userId?: string) => {
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const stats =
        await UserFlashcardStatsService.getUserFlashcardStatsSummary(userId);

      set({
        flashcardsAnsweredToday: stats.flashcardsAnsweredToday,
        lastSyncTime: new Date(),
        statsSummary: stats,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to sync flashcard count:", error);
      set({
        isLoading: false,
        error: "Failed to sync flashcard count. Please try again.",
      });
    }
  },

  incrementFlashcardCount: () => {
    set((state) => ({
      flashcardsAnsweredToday: state.flashcardsAnsweredToday + 1,
    }));
  },

  resetFlashcardCount: () => {
    set({
      flashcardsAnsweredToday: 0,
      lastSyncTime: null,
    });
  },

  fetchFlashcardStats: async (flashcardId: string, userId?: string) => {
    if (!userId || !flashcardId) return;

    // Skip if we already have stats for this card
    const state = get();
    if (
      flashcardId === state.currentFlashcardId &&
      state.currentFlashcardStats?.flashcardId === flashcardId
    ) {
      return;
    }

    set({ isLoadingStats: true });

    try {
      const stats = await UserFlashcardStatsService.getFlashcardStats(
        userId,
        flashcardId
      );

      // Only update if this is still the current flashcard
      if (get().currentFlashcardId === flashcardId) {
        set({
          currentFlashcardStats: stats,
          isLoadingStats: false,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch flashcard stats";
      console.error(`[FlashcardStats] Error: ${errorMessage}`);

      set({
        error: errorMessage,
        isLoadingStats: false,
      });
    }
  },

  submitFlashcardAnswer: async (answer) => {
    const userId = answer.userId;
    if (!userId) {
      set({ error: "User ID is required to submit answers" });
      return;
    }

    // Get premium status from the user store
    const userData = useUserStore.getState().userData;
    const isPremium = userData?.isPremium ?? false;

    // Check daily limit for non-premium users
    const currentCount = get().flashcardsAnsweredToday;

    if (!isPremium && currentCount >= DAILY_FLASHCARD_LIMIT) {
      set({
        submissionMessage: {
          text: "Daily flashcard limit reached. Upgrade to premium for unlimited access!",
          type: "error",
        },
      });
      return;
    }

    try {
      // Submit to backend first
      const updatedStats =
        await UserFlashcardStatsService.submitFlashcardAnswer({
          ...answer,
          userId,
        });

      // Update local count by incrementing it since the API doesn't return a total
      set({
        flashcardsAnsweredToday: currentCount + 1,
      });

      // Show appropriate feedback message
      const message = {
        text: answer.wasCorrect
          ? "Great job! Moving to the next card..."
          : "Keep practicing! This card will appear again later.",
        type: answer.wasCorrect ? ("success" as const) : ("error" as const),
      };

      set({
        submissionMessage: message,
        currentFlashcardStats: updatedStats,
      });

      // Check if we reached limit after this submission
      const newCount = currentCount + 1;
      if (!isPremium && newCount >= DAILY_FLASHCARD_LIMIT) {
        // Set timeout to update the message after showing the success/error message
        setTimeout(() => {
          set({
            submissionMessage: {
              text: "You've reached your daily limit! Upgrade to premium for unlimited access.",
              type: "error",
            },
          });
        }, 2000);
      }

      // Delay before moving to next card
      setTimeout(() => {
        get().goToNextCard();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit answer";
      console.error(`[SubmitAnswer] Error: ${errorMessage}`);

      set({
        submissionMessage: {
          text: "Error recording your answer. Please try again.",
          type: "error",
        },
      });

      // Clear error message after delay
      setTimeout(() => {
        set({ submissionMessage: null });
      }, 2000);
    }
  },

  // ===== HELPER FUNCTIONS =====

  isDailyLimitReached: (isPremium: boolean) => {
    // Premium users have no limit
    if (isPremium) return false;

    // Check against daily limit for free users
    return get().flashcardsAnsweredToday >= DAILY_FLASHCARD_LIMIT;
  },

  // Check if we're allowed to fetch new cards
  canFetchNewCards: (isPremium: boolean) => {
    if (isPremium) return true;
    return get().flashcardsAnsweredToday < DAILY_FLASHCARD_LIMIT;
  },
}));
