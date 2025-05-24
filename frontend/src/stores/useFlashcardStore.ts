import { create } from 'zustand';
import { UserFlashcardStatsService } from '@services/data/userFlashcardStatsService';
import flashcardService from '@services/data/flashcardService';
import {
  FlashcardResponse,
  FlashcardRequest,
  FlashcardCategory,
  DifficultyLevel,
} from '@src/types/Flashcard';
import {
  UserFlashcardStatResponse,
  UserFlashcardStatsSummaryResponse,
  SubmitFlashcardAnswerRequest,
} from '@src/types/UserFlashcardStats';
import { useUserStore } from './useUserStore';
import { apiClient } from '@services/api/apiClient';

// Constants
export const DAILY_FLASHCARD_LIMIT = 25;

// Types
export interface FlashcardMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

// Store state organized by domain
interface FlashcardState {
  flashcards: FlashcardResponse[];
  currentIndex: number;
  currentFlashcardId: string | null;
  flipped: boolean;
  isDeckCompleted: boolean;
  hasAttemptedLoad: boolean;
}

interface StatsState {
  flashcardsViewedToday: number;
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
  advanceCardAndProcess: (
    currentActualCardId: string,
    userId: string
  ) => Promise<void>;

  // Stats actions
  syncFlashcardCount: (userId?: string) => Promise<void>;
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
  hasAttemptedLoad: false,

  // Stats state
  flashcardsViewedToday: 0,
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
    // Always sync with server first to get the latest count
    if (userId) {
      await get().syncFlashcardCount(userId);
    }

    // Skip if daily limit reached for non-premium users
    if (!isPremium && get().flashcardsViewedToday >= DAILY_FLASHCARD_LIMIT) {
      // Set explicit message when trying to fetch with limit reached
      set({
        hasAttemptedLoad: true,
        isDeckCompleted: true,
        submissionMessage: {
          text: 'Daily flashcard limit reached. Upgrade to premium for unlimited access!',
          type: 'error',
        },
      });
      return;
    }

    set({
      isLoadingFlashcards: true,
      error: null,
      isDeckCompleted: false,
      currentFlashcardId: null,
      flipped: false, // Reset flipped state when fetching new cards
    });

    try {
      const numericId = parseInt(categoryId, 10);
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
        hasAttemptedLoad: true,
        flipped: false, // Ensure flipped is false for new flashcards
      });

      // Fetch stats for first flashcard if available
      if (flashcards.length > 0 && userId) {
        get().fetchFlashcardStats(flashcards[0].id, userId);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load flashcards';

      set({
        isLoadingFlashcards: false,
        error: errorMessage,
        flashcards: [],
        hasAttemptedLoad: true,
      });
    }
  },

  handleFlip: () => set((state) => ({ flipped: !state.flipped })),

  goToNextCard: () => {
    set((state) => {
      if (state.currentIndex >= state.flashcards.length - 1) {
        return {
          isDeckCompleted: true,
          submissionMessage: {
            text: "You've completed all cards in this deck!",
            type: 'info',
          },
          currentFlashcardStats: null, // Clear stats on completion
          currentFlashcardId: null, // Clear current card ID
        };
      }

      const nextIndex = state.currentIndex + 1;
      const nextFlashcard = state.flashcards[nextIndex];
      return {
        currentIndex: nextIndex,
        currentFlashcardId: nextFlashcard.id,
        flipped: false,
        submissionMessage: null,
        currentFlashcardStats: null, // Clear stats for the new card, will be fetched by advanceCardAndProcess
      };
    });
  },

  advanceCardAndProcess: async (
    currentActualCardId: string,
    userId: string,
  ) => {
    if (!currentActualCardId || !userId) {
      console.error(
        '[advanceCardAndProcess] currentActualCardId and userId are required.',
      );
      set({ error: 'Cannot advance card: missing card or user ID.' });
      return;
    }

    try {
      // 1. Increment view count for the card being left
      await apiClient.incrementFlashcardViewCount(currentActualCardId);
      // After incrementing view count, immediately sync to update flashcardsViewedToday
      await get().syncFlashcardCount(userId);
    } catch (err) {
      console.error(
        `[advanceCardAndProcess] Failed to increment view count for ${currentActualCardId}:`,
        err,
      );
      // Non-critical, so we proceed, but good to log.
      // Potentially set an error in store if this failure should be user-visible:
      // set({ error: "Failed to update view count. Please try again." });
    }

    // 2. Advance to the next card (synchronous state update)
    get().goToNextCard();

    // 3. Fetch stats for the new current card if the deck is not completed
    const { currentFlashcardId, isDeckCompleted } = get();
    if (!isDeckCompleted && currentFlashcardId) {
      try {
        await get().fetchFlashcardStats(currentFlashcardId, userId);
      } catch (err) {
        // fetchFlashcardStats should handle its own error logging and state.error setting
        console.error(
          `[advanceCardAndProcess] Error fetching stats for new card ${currentFlashcardId}:`,
          err,
        );
      }
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
      hasAttemptedLoad: false,
      isLoadingFlashcards: false, // Reset loading state as well
    });
  },

  // ===== STATS ACTIONS =====

  syncFlashcardCount: async (userId?: string) => {
    if (!userId) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const stats =
        await UserFlashcardStatsService.getUserFlashcardStatsSummary(userId);

      set({
        flashcardsViewedToday: stats.flashcardsViewedToday,
        lastSyncTime: new Date(),
        statsSummary: stats,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to sync flashcard count:', error);
      set({
        isLoading: false,
        error: 'Failed to sync flashcard count. Please try again.',
      });
    }
  },

  resetFlashcardCount: () => {
    set({
      flashcardsViewedToday: 0,
      lastSyncTime: null,
    });
  },

  fetchFlashcardStats: async (flashcardId: string, userId?: string) => {
    if (!userId || !flashcardId) {
      return;
    }

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
        flashcardId,
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
        err instanceof Error ? err.message : 'Failed to fetch flashcard stats';
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
      set({ error: 'User ID is required to submit answers' });
      return;
    }

    // Note: The daily limit check here might be redundant if this function is
    // no longer tied to the main flashcard viewing flow which controls the daily VIEW limit.
    // However, keeping it for now ensures safety if it's used in a context where limit applies.
    const userData = useUserStore.getState().userData;
    const isPremium = userData?.isPremium ?? false;
    const currentViewCount = get().flashcardsViewedToday; // Check against view count

    if (!isPremium && currentViewCount >= DAILY_FLASHCARD_LIMIT) {
      set({
        submissionMessage: {
          text: 'Daily flashcard viewing limit reached. Upgrade to premium for unlimited access!',
          type: 'error',
        },
      });
      return;
    }

    try {
      const updatedStats =
        await UserFlashcardStatsService.submitFlashcardAnswer({
          ...answer,
          userId,
        });

      // Sync general stats summary, which now includes flashcardsViewedToday
      await get().syncFlashcardCount(userId);

      const message = {
        text: answer.wasCorrect
          ? 'Great job! Moving to the next card...'
          : 'Keep practicing! This card will appear again later.',
        type: answer.wasCorrect ? ('success' as const) : ('error' as const),
      };

      set({
        submissionMessage: message,
        currentFlashcardStats: updatedStats,
      });

      // This check is also based on flashcardsViewedToday now.
      if (!isPremium && get().flashcardsViewedToday >= DAILY_FLASHCARD_LIMIT) {
        setTimeout(() => {
          set({
            submissionMessage: {
              text: "You've reached your daily viewing limit! Upgrade to premium for unlimited access.",
              type: 'error',
            },
          });
        }, 2000);
      }

      setTimeout(() => {
        get().goToNextCard();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit answer';
      console.error(`[SubmitAnswer] Error: ${errorMessage}`);

      set({
        submissionMessage: {
          text: 'Error recording your answer. Please try again.',
          type: 'error',
        },
      });

      setTimeout(() => {
        set({ submissionMessage: null });
      }, 2000);
    }
  },

  // ===== HELPER FUNCTIONS =====

  isDailyLimitReached: (isPremium: boolean) => {
    if (isPremium) {
      return false;
    }
    return get().flashcardsViewedToday >= DAILY_FLASHCARD_LIMIT;
  },

  canFetchNewCards: (isPremium: boolean) => {
    if (isPremium) {
      return true;
    }
    return get().flashcardsViewedToday < DAILY_FLASHCARD_LIMIT;
  },
}));
