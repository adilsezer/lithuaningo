import { useState } from "react";
import { reportService } from "@services/data/reportService";
import { Report } from "@src/types/Report";

export const useReport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async (
    report: Pick<Report, "contentId" | "reportedBy" | "reason" | "details">
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await reportService.submitReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isSubmitting,
    error,
    submitReport,
    clearError,
  };
};
