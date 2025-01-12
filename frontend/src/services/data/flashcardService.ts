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

  async uploadFile(file: File): Promise<string> {
    try {
      // Validate file type
      if (file.type.startsWith("audio/") || file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("File", file);
        return apiClient.uploadFlashcardFile(formData);
      } else {
        throw new Error(
          "Invalid file type. Only audio and image files are allowed."
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async createFlashcard(
    flashcard: Omit<Flashcard, "id" | "createdAt">,
    image?: File,
    audio?: File
  ): Promise<string> {
    try {
      // First upload any files and get their URLs
      const [imageUrl, audioUrl] = await Promise.all([
        image ? this.uploadFile(image) : Promise.resolve(undefined),
        audio ? this.uploadFile(audio) : Promise.resolve(undefined),
      ]);

      // Create flashcard with the URLs
      const flashcardData = {
        ...flashcard,
        imageUrl,
        audioUrl,
      };

      return apiClient.createFlashcard(flashcardData);
    } catch (error) {
      console.error("Error in createFlashcard:", error);
      throw error;
    }
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
