import apiClient from "@services/api/apiClient";
import { DeckReport } from "@src/types";

export const reportService = {
  submitReport: async (
    report: Pick<DeckReport, "deckId" | "reporterId" | "reason" | "details">
  ): Promise<void> => {
    if (
      !report.deckId ||
      !report.reporterId ||
      !report.reason ||
      !report.details
    ) {
      throw new Error("Missing required fields for report submission");
    }

    await apiClient.createDeckReport(report);
  },

  getReports: async (
    status: DeckReport["status"] = "pending",
    limit: number = 50
  ): Promise<DeckReport[]> => {
    return apiClient.getDeckReports(status, limit);
  },

  getReport: async (id: string): Promise<DeckReport> => {
    return apiClient.getDeckReport(id);
  },

  getDeckReports: async (deckId: string): Promise<DeckReport[]> => {
    return apiClient.getDeckReportsByDeckId(deckId);
  },

  updateReportStatus: async (
    id: string,
    status: DeckReport["status"],
    reviewedBy: string,
    resolution?: string
  ): Promise<void> => {
    await apiClient.updateDeckReportStatus(id, {
      status,
      reviewedBy,
      resolution,
    });
  },
};
