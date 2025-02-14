import apiClient from "@services/api/apiClient";
import {
  DeckReport,
  CreateDeckReportRequest,
  UpdateDeckReportRequest,
} from "@src/types";
import { ApiError } from "@services/api/apiClient";

class DeckReportService {
  async submitReport(request: CreateDeckReportRequest): Promise<void> {
    try {
      if (
        !request.deckId ||
        !request.userId ||
        !request.reason ||
        !request.details
      ) {
        throw new Error("Missing required fields for report submission");
      }
      await apiClient.createDeckReport(request);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to submit report: ${error.message}`);
      }
      throw error;
    }
  }

  async getReports(
    status: DeckReport["status"] = "pending",
    limit: number = 50
  ): Promise<DeckReport[]> {
    try {
      return await apiClient.getDeckReports(status, limit);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }
      throw error;
    }
  }

  async getReport(id: string): Promise<DeckReport> {
    try {
      return await apiClient.getDeckReport(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch report: ${error.message}`);
      }
      throw error;
    }
  }

  async getDeckReports(deckId: string): Promise<DeckReport[]> {
    try {
      return await apiClient.getDeckReportsByDeckId(deckId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch deck reports: ${error.message}`);
      }
      throw error;
    }
  }

  async updateReportStatus(
    id: string,
    request: UpdateDeckReportRequest
  ): Promise<void> {
    try {
      await apiClient.updateDeckReportStatus(id, request);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update report status: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new DeckReportService();
