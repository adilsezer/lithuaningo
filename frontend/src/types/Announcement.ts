export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  timeRemaining?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  isActive: boolean;
  validUntil?: string;
}

export interface UpdateAnnouncementRequest {
  title: string;
  content: string;
  isActive: boolean;
  validUntil?: string;
}
