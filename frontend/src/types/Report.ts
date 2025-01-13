export interface Report {
  id?: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string;
  reportedBy: string;
  createdAt?: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
}
