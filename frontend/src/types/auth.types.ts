// Move shared types here
export interface AuthResponse {
  success: boolean;
  message?: string;
  code?: string;
  email?: string;
  cleanup?: () => Promise<void>;
}
