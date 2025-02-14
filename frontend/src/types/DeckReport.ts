export interface DeckReport {
  id: string;
  deckId: string;
  userId: string;
  reviewerId?: string;
  reason: string;
  details: string;
  status: "pending" | "resolved" | "rejected";
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeckReportRequest {
  deckId: string;
  userId: string;
  reason: string;
  details: string;
}

export interface UpdateDeckReportRequest {
  status: "pending" | "resolved" | "rejected";
  reviewerId: string;
  resolution: string;
}
