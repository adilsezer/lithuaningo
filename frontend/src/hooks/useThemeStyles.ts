import { useContext } from "react";
import { ThemeContext } from "@context/ThemeContext";
import { lightThemeColors, darkThemeColors } from "@src/styles/colors";
import { createBaseStyles } from "@styles/baseStyles";

export const useThemeStyles = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("useThemeStyles must be used within a ThemeProvider");
  }

  const { isDarkMode } = themeContext;
  const colors = isDarkMode ? darkThemeColors : lightThemeColors;
  const { layout, components } = createBaseStyles(colors);

  return { colors, layout, components };
};
