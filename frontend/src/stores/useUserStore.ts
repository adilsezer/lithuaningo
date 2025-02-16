import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "@src/types/UserProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export type UserData = Pick<
  UserProfile,
  | "id"
  | "email"
  | "fullName"
  | "emailVerified"
  | "isAdmin"
  | "isPremium"
  | "premiumExpiresAt"
>;

interface UserStore {
  // State
  isLoggedIn: boolean;
  userData: UserData | null;
  needsReauthentication: boolean;
  error: string | null;
  isAuthenticated: boolean;
  storageInitialized: boolean;

  // Actions
  logIn: (userData: UserData) => void;
  logOut: () => void;
  updateUserProfile: (userData: Partial<UserData>) => void;
  requireReauthentication: () => void;
  clearReauthentication: () => void;
  deleteAccount: () => void;
  setError: (error: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  setStorageInitialized: (value: boolean) => void;
}

// Custom storage with error handling
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (err) {
      console.warn(`Error reading from AsyncStorage: ${err}`);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (err) {
      console.warn(`Error writing to AsyncStorage: ${err}`);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (err) {
      console.warn(`Error removing from AsyncStorage: ${err}`);
    }
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      isLoggedIn: false,
      userData: null,
      needsReauthentication: false,
      error: null,
      isAuthenticated: false,
      storageInitialized: false,

      // Actions
      logIn: (userData) => {
        console.log("[UserStore] Logging in user:", {
          id: userData.id,
          email: userData.email,
          emailVerified: userData.emailVerified,
        });
        set({
          isLoggedIn: true,
          userData,
          needsReauthentication: false,
          error: null,
        });
        console.log("[UserStore] User logged in successfully");
      },

      logOut: () => {
        console.log("[UserStore] Logging out user");
        set({
          isLoggedIn: false,
          userData: null,
          needsReauthentication: false,
          error: null,
          isAuthenticated: false,
        });
        console.log("[UserStore] User logged out successfully");
      },

      updateUserProfile: (userData) =>
        set((state) => ({
          ...state,
          userData: state.userData ? { ...state.userData, ...userData } : null,
        })),

      requireReauthentication: () => set({ needsReauthentication: true }),
      clearReauthentication: () => set({ needsReauthentication: false }),

      deleteAccount: () => {
        console.log("[UserStore] Deleting account and clearing state");
        set({
          isLoggedIn: false,
          userData: null,
          needsReauthentication: false,
          error: null,
          isAuthenticated: false,
        });
        console.log("[UserStore] Account deleted and state cleared");
      },

      setError: (error) => set({ error }),
      setAuthenticated: (value) => {
        console.log("[UserStore] Setting authenticated state:", value);
        set({ isAuthenticated: value });
      },
      setStorageInitialized: (value) => set({ storageInitialized: value }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        state?.setStorageInitialized(true);
      },
    }
  )
);

// Hooks
export const useUserData = () => useUserStore((state) => state.userData);
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn);
export const useUserError = () => useUserStore((state) => state.error);
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);
export const useIsStorageInitialized = () =>
  useUserStore((state) => state.storageInitialized);

// Selector hooks for new properties
export const useIsAdmin = () =>
  useUserStore((state) => state.userData?.isAdmin ?? false);
export const useIsPremium = () =>
  useUserStore((state) => state.userData?.isPremium ?? false);
export const usePremiumExpiresAt = () =>
  useUserStore((state) => state.userData?.premiumExpiresAt);
export const useIsEmailVerified = () =>
  useUserStore((state) => state.userData?.emailVerified ?? false);
