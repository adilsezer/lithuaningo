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
  | "authProvider"
>;

interface UserStore {
  // State
  userData: UserData | null;
  isAuthenticated: boolean;

  // Actions
  logIn: (userData: UserData) => void;
  logOut: () => void;
  updateUserProfile: (userData: Partial<UserData>) => void;
  deleteAccount: () => void;
  setAuthenticated: (value: boolean) => void;
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
      userData: null,
      isAuthenticated: false,

      // Actions
      logIn: (userData) => {
        set({
          userData,
          isAuthenticated: true,
        });
      },

      logOut: () => {
        set({
          userData: null,
          isAuthenticated: false,
        });
      },

      updateUserProfile: (userData) =>
        set((state) => ({
          ...state,
          userData: state.userData ? { ...state.userData, ...userData } : null,
        })),

      deleteAccount: () => {
        set({
          userData: null,
          isAuthenticated: false,
        });
      },

      setAuthenticated: (value) => {
        set({ isAuthenticated: value });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => customStorage),
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
export const usePremiumExpiresAt = () =>
  useUserStore((state) => state.userData?.premiumExpiresAt);
export const useIsEmailVerified = () =>
  useUserStore((state) => state.userData?.emailVerified ?? false);
