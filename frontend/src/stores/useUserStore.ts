import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfileResponse } from "@src/types";

// Types
export type UserData = Pick<
  UserProfileResponse,
  | "id"
  | "email"
  | "fullName"
  | "avatarUrl"
  | "emailVerified"
  | "isAdmin"
  | "isPremium"
  | "authProvider"
  | "termsAccepted"
>;

interface UserState {
  isAuthenticated: boolean;
  sessionLoading: boolean;
  isVerifyingEmail: boolean;
  userData: UserData | null;
  logIn: (userData: UserData) => void;
  logOut: () => void;
  updateUserData: (updates: Partial<UserData>) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setSessionLoading: (loading: boolean) => void;
  setVerifyingEmail: (isVerifying: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // State
      isAuthenticated: false,
      sessionLoading: true,
      isVerifyingEmail: false,
      userData: null,

      // Actions
      logIn: (userData) => {
        console.log("[AuthStore] Logging in user:", userData.id);
        set({ isAuthenticated: true, userData, sessionLoading: false });
      },

      logOut: () => {
        console.log("[AuthStore] Logging out user.");
        set({
          isAuthenticated: false,
          userData: null,
          sessionLoading: false,
        });
      },

      updateUserData: (updates) =>
        set((state) => ({
          ...state,
          userData: state.userData ? { ...state.userData, ...updates } : null,
        })),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setSessionLoading: (loading) => set({ sessionLoading: loading }),
      setVerifyingEmail: (isVerifying) =>
        set({ isVerifyingEmail: isVerifying }),
    }),
    {
      name: "user-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hooks
export const useUserData = () => useUserStore((state) => state.userData);
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);

// Selector hooks for new properties
export const useIsAdmin = () =>
  useUserStore((state) => state.userData?.isAdmin ?? false);
export const useIsPremium = () =>
  useUserStore((state) => state.userData?.isPremium ?? false);
export const useIsEmailVerified = () =>
  useUserStore((state) => state.userData?.emailVerified ?? false);
export const useHasAcceptedTerms = () =>
  useUserStore((state) => state.userData?.termsAccepted ?? false);
