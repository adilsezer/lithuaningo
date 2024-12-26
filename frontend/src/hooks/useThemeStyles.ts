import { useContext } from "react";
import { ThemeContext } from "@context/ThemeContext";
import { lightThemeColors, darkThemeColors } from "@src/styles/theme/colors";
import { getGlobalStyles } from "@styles/global/globalStyles";

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
