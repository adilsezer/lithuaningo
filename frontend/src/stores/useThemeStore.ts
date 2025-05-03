import { create } from "zustand";
import { Appearance } from "react-native";
import { storeData, retrieveData } from "@utils/storageUtils";

interface ThemeState {
  isDarkMode: boolean;
  manualMode: boolean;
  isLoading: boolean;
}

interface ThemeActions {
  toggleTheme: () => Promise<void>;
  initializeTheme: () => Promise<void>;
  setManualMode: (manual: boolean) => void;
}

const THEME_KEYS = {
  THEME: "theme",
};

const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  isDarkMode: false,
  manualMode: false,
  isLoading: true,

  toggleTheme: async () => {
    try {
      set((state) => {
        const newMode = !state.isDarkMode;
        storeData(THEME_KEYS.THEME, newMode ? "dark" : "light");
        return { isDarkMode: newMode, manualMode: true };
      });
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  },

  initializeTheme: async () => {
    try {
      const storedTheme = await retrieveData<string>(THEME_KEYS.THEME);
      if (storedTheme !== null) {
        set({ isDarkMode: storedTheme === "dark", manualMode: true });
      } else {
        const colorScheme = Appearance.getColorScheme();
        set({ isDarkMode: colorScheme === "dark", manualMode: false });
      }
    } catch (error) {
      console.error("Failed to load theme", error);
      const colorScheme = Appearance.getColorScheme();
      set({ isDarkMode: colorScheme === "dark", manualMode: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setManualMode: (manual: boolean) => {
    set({ manualMode: manual });
    if (!manual) {
      const colorScheme = Appearance.getColorScheme();
      set({ isDarkMode: colorScheme === "dark" });
    }
  },
}));

// Selectors
export const useIsDarkMode = () => useThemeStore((state) => state.isDarkMode);
export const useThemeActions = () => {
  const state = useThemeStore();
  return {
    toggleTheme: state.toggleTheme,
    initializeTheme: state.initializeTheme,
  };
};

export default useThemeStore;
