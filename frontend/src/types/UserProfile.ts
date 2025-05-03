export interface UserProfileResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  isAdmin: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
  authProvider: string;
}

export interface UpdateUserProfileRequest {
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
}
