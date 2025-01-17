export interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string;
  reportedBy: string;
  createdAt: Date;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  resolution?: string | null;
}
