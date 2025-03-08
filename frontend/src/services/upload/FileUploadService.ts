import { MediaFile, ImageFile, AudioFile } from "@src/types";
import { apiClient } from "@services/api/apiClient";
import { createFormDataFromFile } from "@utils/formUtils";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class FileUploadService {
  async uploadDeckImage(file: ImageFile): Promise<string> {
    this.validateImageFile(file);
    const formData = createFormDataFromFile(file);
    return await apiClient.uploadDeckFile(formData);
  }

  async uploadFlashcardImage(file: ImageFile): Promise<string> {
    this.validateImageFile(file);
    const formData = createFormDataFromFile(file);
    return await apiClient.uploadFile(formData);
  }

  async uploadFlashcardAudio(file: AudioFile): Promise<string> {
    this.validateAudioFile(file);
    const formData = createFormDataFromFile(file);
    return await apiClient.uploadFile(formData);
  }

  private validateImageFile(file: MediaFile): void {
    if (!this.isValidImageFile(file)) {
      throw new ValidationError("Only image files are allowed");
    }

    const fileSize = file.size ?? 0;
    if (fileSize > MAX_IMAGE_SIZE) {
      throw new ValidationError("File size must not exceed 5MB");
    }
  }

  private validateAudioFile(file: MediaFile): void {
    if (!this.isValidAudioFile(file)) {
      throw new ValidationError("Only audio files are allowed");
    }

    const fileSize = file.size ?? 0;
    if (fileSize > MAX_AUDIO_SIZE) {
      throw new ValidationError("File size must not exceed 10MB");
    }
  }

  private isValidImageFile(file: MediaFile): boolean {
    return file.type.startsWith("image/");
  }

  private isValidAudioFile(file: MediaFile): boolean {
    return file.type.startsWith("audio/");
  }
}

export const fileUploadService = new FileUploadService();
