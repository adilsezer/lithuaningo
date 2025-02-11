import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "@src/types/UserProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export type UserData = Pick<UserProfile, "id" | "email" | "fullName">;

interface UserStore {
  // Existing state
  isLoggedIn: boolean;
  userData: UserData | null;
  needsReauthentication: boolean;
  error: string | null;

  // New auth-specific state
  isAuthenticated: boolean;
  storageInitialized: boolean;

  // Existing actions
  logIn: (userData: UserData) => void;
  logOut: () => void;
  updateUserProfile: (userData: Partial<UserData>) => void;
  requireReauthentication: () => void;
  clearReauthentication: () => void;
  deleteAccount: () => void;
  setError: (error: string | null) => void;

  // New auth-specific actions
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
      // Existing state
      isLoggedIn: false,
      userData: null,
      needsReauthentication: false,
      error: null,

      // New auth state
      isAuthenticated: false,
      storageInitialized: false,

      // Existing actions
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
          isAuthenticated: false, // Clear auth state on logout
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
          isAuthenticated: false, // Clear auth state on account deletion
        }),

      setError: (error) => set({ error }),

      // New auth action
      setAuthenticated: (value) => set({ isAuthenticated: value }),
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

// Existing hooks
export const useUserData = () => useUserStore((state) => state.userData);
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn);
export const useUserError = () => useUserStore((state) => state.error);

// New auth-specific hook
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);

export const useIsStorageInitialized = () =>
  useUserStore((state) => state.storageInitialized);
