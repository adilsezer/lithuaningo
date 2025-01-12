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

  async createFlashcard(
    flashcard: Omit<Flashcard, "id" | "createdAt">,
    image?: File,
    audio?: File
  ): Promise<string> {
    let uploadedUrls = {};

    if (image || audio) {
      uploadedUrls = await this.uploadFiles(image, audio);
    }

    const flashcardWithUrls = {
      ...flashcard,
      ...uploadedUrls,
    };

    return apiClient.createFlashcard(flashcardWithUrls as Flashcard);
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

  async uploadFiles(image?: File, audio?: File) {
    const formData = new FormData();
    if (image) formData.append("image", image);
    if (audio) formData.append("audio", audio);
    return apiClient.uploadFlashcardFiles(formData);
  }
}

export default new FlashcardService();
