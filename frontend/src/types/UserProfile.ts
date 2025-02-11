export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  timeAgo: string;
  lastLoginTimeAgo?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserProfileRequest {
  userId: string;
}

export interface UpdateUserProfileRequest {
  email: string;
  fullName: string;
  avatarUrl?: string;
}
