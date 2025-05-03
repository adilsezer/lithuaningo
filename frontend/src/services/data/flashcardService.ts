import { apiClient } from "@services/api/apiClient";
import { FlashcardRequest, FlashcardResponse } from "@src/types/Flashcard";

/**
 * Service for managing flashcards
 */
class FlashcardService {
  /**
   * Fetch flashcards based on provided request parameters
   * @param request The flashcard request parameters
   */
  async getFlashcards(request: FlashcardRequest): Promise<FlashcardResponse[]> {
    try {
      return await apiClient.getFlashcards(request);
    } catch (error) {
      console.error("[FlashcardService] Error fetching flashcards:", error);
      throw error;
    }
  }
}

export default new FlashcardService();
