import apiClient from "../api/apiClient";
import {
  Flashcard,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
} from "@src/types";

class FlashcardService {
  async getDeckFlashcards(deckId: string) {
    return apiClient.getDeckFlashcards(deckId);
  }

  async createFlashcard(
    flashcard: Omit<CreateFlashcardRequest, "imageUrl" | "audioUrl">,
    imageFile?: File,
    audioFile?: File
  ): Promise<string> {
    try {
      const [imageUrl, audioUrl] = await Promise.all([
        imageFile ? this.uploadFile(imageFile) : Promise.resolve(""),
        audioFile ? this.uploadFile(audioFile) : Promise.resolve(""),
      ]);

      return apiClient.createFlashcard({
        ...flashcard,
        imageUrl: imageUrl || "",
        audioUrl: audioUrl || "",
      });
    } catch (error) {
      console.error("Error in createFlashcard:", error);
      throw error;
    }
  }

  async updateFlashcard(
    id: string,
    flashcard: Omit<UpdateFlashcardRequest, "imageUrl" | "audioUrl">,
    imageFile?: File,
    audioFile?: File,
    currentImageUrl: string = "",
    currentAudioUrl: string = ""
  ) {
    try {
      const [imageUrl, audioUrl] = await Promise.all([
        imageFile
          ? this.uploadFile(imageFile)
          : Promise.resolve(currentImageUrl),
        audioFile
          ? this.uploadFile(audioFile)
          : Promise.resolve(currentAudioUrl),
      ]);

      return apiClient.updateFlashcard(id, {
        ...flashcard,
        imageUrl: imageUrl || "",
        audioUrl: audioUrl || "",
      });
    } catch (error) {
      console.error("Error updating flashcard:", error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      if (file.type.startsWith("audio/") || file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.uploadFile(formData);
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

  async deleteFlashcard(id: string) {
    return apiClient.deleteFlashcard(id);
  }

  async getFlashcardById(id: string) {
    return apiClient.getFlashcardById(id);
  }

  async updateReviewStatus(id: string, wasCorrect: boolean) {
    return apiClient.updateReviewStatus(id, { wasCorrect });
  }
}

export default new FlashcardService();
