import apiClient from "../api/apiClient";
import { fileUploadService } from "../upload/FileUploadService";
import {
  Flashcard,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  ImageFile,
  AudioFile,
} from "@src/types";

class FlashcardService {
  async getDeckFlashcards(deckId: string) {
    return apiClient.getDeckFlashcards(deckId);
  }

  async createFlashcard(
    flashcard: Omit<CreateFlashcardRequest, "imageUrl" | "audioUrl">,
    imageFile?: ImageFile,
    audioFile?: AudioFile
  ): Promise<string> {
    try {
      const [imageUrl, audioUrl] = await Promise.all([
        imageFile
          ? fileUploadService.uploadFlashcardImage(imageFile)
          : Promise.resolve(""),
        audioFile
          ? fileUploadService.uploadFlashcardAudio(audioFile)
          : Promise.resolve(""),
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
    imageFile?: ImageFile,
    audioFile?: AudioFile,
    currentImageUrl: string = "",
    currentAudioUrl: string = ""
  ) {
    try {
      const [imageUrl, audioUrl] = await Promise.all([
        imageFile
          ? fileUploadService.uploadFlashcardImage(imageFile)
          : Promise.resolve(currentImageUrl),
        audioFile
          ? fileUploadService.uploadFlashcardAudio(audioFile)
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

  async deleteFlashcard(id: string) {
    return apiClient.deleteFlashcard(id);
  }

  async getFlashcardById(id: string) {
    return apiClient.getFlashcardById(id);
  }
}

export default new FlashcardService();
