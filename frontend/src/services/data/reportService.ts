import apiClient from "@services/api/apiClient";
import { Report } from "@src/types/Report";

export const reportService = {
  submitReport: async (
    report: Pick<Report, "contentId" | "reportedBy" | "reason" | "details">
  ): Promise<void> => {
    if (
      !report.contentId ||
      !report.reportedBy ||
      !report.reason ||
      !report.details
    ) {
      throw new Error("Missing required fields for report submission");
    }

    await apiClient.createReport({
      ...report,
      contentType: "deck",
      status: "pending",
    });
  },

  getReports: async (
    status: Report["status"] = "pending",
    limit: number = 50
  ): Promise<Report[]> => {
    return apiClient.getReports(status, limit);
  },

  getReport: async (id: string): Promise<Report> => {
    return apiClient.getReport(id);
  },

  getContentReports: async (
    contentType: string,
    contentId: string
  ): Promise<Report[]> => {
    return apiClient.getContentReports(contentType, contentId);
  },

  updateReportStatus: async (
    id: string,
    status: Report["status"],
    reviewedBy: string,
    resolution?: string
  ): Promise<void> => {
    await apiClient.updateReportStatus(id, status, reviewedBy, resolution);
  },
};
