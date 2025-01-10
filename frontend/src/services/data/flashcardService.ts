import apiClient from "../api/apiClient";
import { Flashcard } from "@src/types";

class FlashcardService {
  async getDeckFlashcards(deckId: string) {
    return apiClient.getDeckFlashcards(deckId);
  }

  async addFlashcardToDeck(
    deckId: string,
    flashcard: Omit<Flashcard, "id" | "createdAt">
  ) {
    return apiClient.addFlashcardToDeck(deckId, flashcard as Flashcard);
  }

  async removeFlashcardFromDeck(deckId: string, flashcardId: string) {
    return apiClient.removeFlashcardFromDeck(deckId, flashcardId);
  }

  async createFlashcard(flashcard: Omit<Flashcard, "id" | "createdAt">) {
    return apiClient.createFlashcard(flashcard as Flashcard);
  }

  async updateFlashcard(id: string, flashcard: Partial<Flashcard>) {
    return apiClient.updateFlashcard(id, flashcard as Flashcard);
  }

  async deleteFlashcard(id: string) {
    return apiClient.deleteFlashcard(id);
  }

  async getFlashcardById(id: string) {
    return apiClient.getFlashcardById(id);
  }
}

export default new FlashcardService();
