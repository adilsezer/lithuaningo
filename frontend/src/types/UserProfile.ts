export interface UserProfileResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  isAdmin: boolean;
  isPremium: boolean;
  authProvider: string;
  termsAccepted: boolean;
}

export interface UpdateUserProfileRequest {
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isPremium: boolean;
  termsAccepted: boolean;
}
