export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  hasPurchasedExtraContent: boolean;
}
