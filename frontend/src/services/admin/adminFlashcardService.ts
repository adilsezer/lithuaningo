import { apiClient } from '@services/api/apiClient';
import {
  FlashcardResponse,
  UpdateFlashcardAdminRequest,
} from '@src/types/Flashcard';

export const adminFlashcardService = {
  /**
   * Fetches unverified flashcards for admin review.
   * @param limit The maximum number of flashcards to fetch.
   * @returns A promise that resolves to an array of FlashcardResponse.
   */
  async fetchUnverifiedFlashcards(
    limit: number = 20,
  ): Promise<FlashcardResponse[]> {
    try {
      return await apiClient.getUnverifiedFlashcards(limit);
    } catch (error) {
      console.error(
        '[AdminFlashcardService] Error fetching unverified flashcards:',
        error,
      );
      throw error; // Re-throw to be handled by the calling hook/component
    }
  },

  /**
   * Updates a flashcard as an admin.
   * @param flashcardId The ID of the flashcard to update.
   * @param request The update request data.
   * @returns A promise that resolves to the updated FlashcardResponse.
   */
  async updateFlashcard(
    flashcardId: string,
    request: UpdateFlashcardAdminRequest,
  ): Promise<FlashcardResponse> {
    try {
      return await apiClient.updateFlashcardAdmin(flashcardId, request);
    } catch (error) {
      console.error('[AdminFlashcardService] Error updating flashcard:', error);
      throw error;
    }
  },

  /**
   * Regenerates the image for a flashcard.
   * @param flashcardId The ID of the flashcard.
   * @returns A promise that resolves to the new image URL.
   */
  async regenerateImage(flashcardId: string): Promise<string> {
    try {
      const response = await apiClient.regenerateFlashcardImage(flashcardId);
      return response.imageUrl;
    } catch (error) {
      console.error(
        '[AdminFlashcardService] Error regenerating flashcard image:',
        error,
      );
      throw error;
    }
  },

  /**
   * Regenerates the audio for a flashcard.
   * @param flashcardId The ID of the flashcard.
   * @returns A promise that resolves to the new audio URL.
   */
  async regenerateAudio(flashcardId: string): Promise<string> {
    try {
      const response = await apiClient.regenerateFlashcardAudio(flashcardId);
      return response.audioUrl;
    } catch (error) {
      console.error(
        '[AdminFlashcardService] Error regenerating flashcard audio:',
        error,
      );
      throw error;
    }
  },
};
