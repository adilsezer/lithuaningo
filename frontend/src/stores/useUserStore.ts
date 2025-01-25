import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@src/types/UserProfile";

// Types
export type UserData = Pick<
  UserProfile,
  "id" | "name" | "email" | "emailVerified"
>;

interface UserStore {
  // State
  isLoggedIn: boolean;
  userData: UserData | null;
  needsReauthentication: boolean;
  error: string | null;

  // Actions
  logIn: (userData: UserData) => void;
  logOut: () => void;
  updateUserProfile: (userData: Partial<UserData>) => void;
  requireReauthentication: () => void;
  clearReauthentication: () => void;
  deleteAccount: () => void;
  setError: (error: string | null) => void;
}

// Helper functions
const isAuthenticated = (state: Pick<UserStore, "isLoggedIn" | "userData">) =>
  state.isLoggedIn && (state.userData?.emailVerified || false);

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Initial state
      isLoggedIn: false,
      userData: null,
      needsReauthentication: false,
      error: null,

      // Actions
      logIn: (userData) =>
        set({
          isLoggedIn: true,
          userData,
          needsReauthentication: false,
          error: null,
        }),

      logOut: () =>
        set({
          isLoggedIn: false,
          userData: null,
          needsReauthentication: false,
          error: null,
        }),

      updateUserProfile: (userData) =>
        set((state) => ({
          ...state,
          userData: state.userData ? { ...state.userData, ...userData } : null,
        })),

      requireReauthentication: () => set({ needsReauthentication: true }),
      clearReauthentication: () => set({ needsReauthentication: false }),

      deleteAccount: () =>
        set({
          isLoggedIn: false,
          userData: null,
          needsReauthentication: false,
          error: null,
        }),

      setError: (error) => set({ error }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Typed hooks for common state
export const useUserData = () => useUserStore((state) => state.userData);
export const useIsAuthenticated = () => useUserStore(isAuthenticated);
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn);
export const useUserError = () => useUserStore((state) => state.error);
