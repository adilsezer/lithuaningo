export interface DeckReport {
  id: string;
  deckId: string;
  reporterId: string;
  reason: string;
  details: string;
  status: "pending" | "resolved" | "rejected";
  reviewedBy?: string;
  reviewedByUserName?: string;
  reportedByUserName: string;
  resolution?: string;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
}
