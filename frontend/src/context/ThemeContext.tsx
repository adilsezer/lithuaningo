import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { Appearance } from "react-native";
import { storeData, retrieveData } from "@utils/storageUtils";
import { THEME_KEYS } from "@config/constants";

export interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await retrieveData<string>(THEME_KEYS.THEME);
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === "dark");
        } else {
          const colorScheme = Appearance.getColorScheme();
          setIsDarkMode(colorScheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load theme", error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      setIsDarkMode((prevMode) => {
        const newMode = !prevMode;
        storeData(THEME_KEYS.THEME, newMode ? "dark" : "light");
        return newMode;
      });
      setManualMode(true);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };

  useEffect(() => {
    if (!manualMode) {
      const colorScheme = Appearance.getColorScheme();
      setIsDarkMode(colorScheme === "dark");
    }
  }, [manualMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { ThemeContext };
