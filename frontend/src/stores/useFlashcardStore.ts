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

interface FlashcardStore {
  // State
  flashcards: FlashcardResponse[];
  currentIndex: number;
  currentFlashcardId: string | null;
  flipped: boolean;
  isDeckCompleted: boolean;
  hasAttemptedLoad: boolean;
  flashcardsViewedToday: number;
  lastSyncTime: Date | null;
  statsSummary: UserFlashcardStatsSummaryResponse | null;
  currentFlashcardStats: UserFlashcardStatResponse | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingFlashcards: boolean;
  error: string | null;
  submissionMessage: FlashcardMessage | null;

  // Actions
  fetchFlashcards: (params: {
    categoryId: string;
    userId?: string;
    isPremium: boolean;
  }) => Promise<void>;
  handleFlip: () => void;
  goToNextCard: () => void;
  resetSession: () => void;
  advanceCardAndProcess: (flashcardId: string, userId: string) => Promise<void>;
  syncFlashcardCount: (userId?: string) => Promise<void>;
  resetFlashcardCount: () => void;
  fetchFlashcardStats: (flashcardId: string, userId?: string) => Promise<void>;
  submitFlashcardAnswer: (
    answer: SubmitFlashcardAnswerRequest & { userId?: string }
  ) => Promise<void>;
  isDailyLimitReached: (isPremium: boolean) => boolean;
  canFetchNewCards: (isPremium: boolean) => boolean;
  retryIncrementViewCount: (
    flashcardId: string,
    userId: string,
    maxRetries?: number
  ) => Promise<boolean>;
}

const createFlashcardRequest = (
  categoryId: string,
  userId?: string
): FlashcardRequest => {
  const numericId = parseInt(categoryId, 10);
  const request: FlashcardRequest = {
    count: 10,
    userId,
    primaryCategory: FlashcardCategory.AllCategories,
    difficulty: DifficultyLevel.Basic,
  };

  if (numericId >= 0 && numericId <= 2) {
    request.difficulty = numericId as DifficultyLevel;
  } else {
    request.primaryCategory = numericId as FlashcardCategory;
  }

  return request;
};

export const useFlashcardStore = create<FlashcardStore>((set, get) => ({
  // Initial State
  flashcards: [],
  currentIndex: 0,
  currentFlashcardId: null,
  flipped: false,
  isDeckCompleted: false,
  hasAttemptedLoad: false,
  flashcardsViewedToday: 0,
  lastSyncTime: null,
  statsSummary: null,
  currentFlashcardStats: null,
  isLoading: false,
  isLoadingStats: false,
  isLoadingFlashcards: false,
  error: null,
  submissionMessage: null,

  // Actions
  fetchFlashcards: async ({ categoryId, userId, isPremium }) => {
    if (userId) {
      await get().syncFlashcardCount(userId);
    }

    if (!isPremium && get().flashcardsViewedToday >= DAILY_FLASHCARD_LIMIT) {
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
      flipped: false,
    });

    try {
      const request = createFlashcardRequest(categoryId, userId);
      const flashcards = await flashcardService.getFlashcards(request);

      set({
        flashcards,
        currentIndex: 0,
        isDeckCompleted: flashcards.length === 0,
        isLoadingFlashcards: false,
        currentFlashcardId: flashcards.length > 0 ? flashcards[0].id : null,
        hasAttemptedLoad: true,
        flipped: false,
      });

      if (flashcards.length > 0 && userId) {
        get().fetchFlashcardStats(flashcards[0].id, userId);
      }
    } catch (err) {
      set({
        isLoadingFlashcards: false,
        error: err instanceof Error ? err.message : 'Failed to load flashcards',
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
          currentFlashcardStats: null,
          currentFlashcardId: null,
        };
      }

      const nextIndex = state.currentIndex + 1;
      const nextFlashcard = state.flashcards[nextIndex];
      return {
        currentIndex: nextIndex,
        currentFlashcardId: nextFlashcard.id,
        flipped: false,
        submissionMessage: null,
        currentFlashcardStats: null,
      };
    });
  },

  advanceCardAndProcess: async (flashcardId: string, userId: string) => {
    if (!flashcardId || !userId) {
      set({ error: 'Cannot advance card: missing card or user ID.' });
      return;
    }

    const viewCountIncremented = await get().retryIncrementViewCount(
      flashcardId,
      userId
    );

    if (!viewCountIncremented) {
      set({
        error:
          'Failed to track flashcard progress after multiple attempts. Your daily count may not be accurate.',
        submissionMessage: {
          text: 'Warning: Progress tracking failed. Please check your connection.',
          type: 'error',
        },
      });
    }

    if (viewCountIncremented) {
      try {
        await get().syncFlashcardCount(userId);
      } catch {
        set({
          submissionMessage: {
            text: 'Progress saved, but display may be outdated. Refresh to see current count.',
            type: 'info',
          },
        });
      }
    }

    get().goToNextCard();

    const { currentFlashcardId, isDeckCompleted } = get();
    if (!isDeckCompleted && currentFlashcardId) {
      try {
        await get().fetchFlashcardStats(currentFlashcardId, userId);
      } catch {
        // Non-critical error, don't block user flow
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
      isLoadingFlashcards: false,
    });
  },

  syncFlashcardCount: async (userId?: string) => {
    if (!userId) return;

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
    } catch {
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
    if (!userId || !flashcardId) return;

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
      if (get().currentFlashcardId === flashcardId) {
        set({
          currentFlashcardStats: stats,
          isLoadingStats: false,
        });
      }
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : 'Failed to fetch flashcard stats',
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

    const userData = useUserStore.getState().userData;
    const isPremium = userData?.isPremium ?? false;
    const currentViewCount = get().flashcardsViewedToday;

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
    } catch {
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

  isDailyLimitReached: (isPremium: boolean) => {
    return !isPremium && get().flashcardsViewedToday >= DAILY_FLASHCARD_LIMIT;
  },

  canFetchNewCards: (isPremium: boolean) => {
    return isPremium || get().flashcardsViewedToday < DAILY_FLASHCARD_LIMIT;
  },

  retryIncrementViewCount: async (
    flashcardId: string,
    userId: string,
    maxRetries = 2
  ) => {
    const totalAttempts = maxRetries + 1;

    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      try {
        await apiClient.incrementFlashcardViewCount(flashcardId);
        return true;
      } catch {
        if (attempt === totalAttempts) {
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
    return false;
  },
}));
