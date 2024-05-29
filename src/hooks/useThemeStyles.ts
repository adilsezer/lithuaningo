import { useColorScheme } from "react-native";
import { lightThemeColors, darkThemeColors } from "../styles/colors"; // Update the import paths as needed
import { getGlobalStyles } from "../styles/globalStyles";

export const useThemeStyles = () => {
  const theme = useColorScheme() || "light"; // Default to 'light' if theme is not determined
  const colors = theme === "dark" ? darkThemeColors : lightThemeColors;
  const styles = getGlobalStyles(colors);

  return { theme, styles, colors };
};
