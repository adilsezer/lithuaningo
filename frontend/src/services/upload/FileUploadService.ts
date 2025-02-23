import { ImageFile } from "@src/types";
import apiClient from "@services/api/apiClient";
import { createFormDataFromFile } from "@utils/formUtils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class FileUploadService {
  async uploadDeckImage(file: ImageFile): Promise<string> {
    this.validateFile(file);
    const formData = createFormDataFromFile(file);
    return await apiClient.uploadDeckFile(formData);
  }

  private validateFile(file: ImageFile): void {
    if (!this.isValidImageFile(file)) {
      throw new ValidationError("Only image files are allowed");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size must not exceed 5MB");
    }
  }

  private isValidImageFile(file: ImageFile): boolean {
    return file.type.startsWith("image/");
  }
}

export const fileUploadService = new FileUploadService();
