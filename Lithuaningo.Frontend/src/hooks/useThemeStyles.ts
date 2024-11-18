// src/hooks/useThemeStyles.ts
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { lightThemeColors, darkThemeColors } from "../styles/colors";
import { getGlobalStyles } from "../styles/globalStyles";

export const useThemeStyles = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("useThemeStyles must be used within a ThemeProvider");
  }

  const { isDarkMode } = themeContext;
  const colors = isDarkMode ? darkThemeColors : lightThemeColors;
  const styles = getGlobalStyles(colors);

  return { styles, colors };
};
