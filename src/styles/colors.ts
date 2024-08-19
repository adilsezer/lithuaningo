export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  active: string;
  inactive: string;
  text: string;
  lightText: string;
  link: string;
  placeholder: string;
  border: string;
  error: string;
  success: string;
  card: string;
  cardText: string;
  wordBackground: string; // Default word background color
  wordHighlightBackground: string; // Highlighted word background color
  buttonText: string;
};

export const lightThemeColors: ThemeColors = {
  primary: "#66BB6A", // Modern vibrant green
  secondary: "#FFC107", // Warm amber
  tertiary: "#d5304f", // Red
  background: "#FFFFFF", // Pure white
  active: "#66BB6A", // Modern vibrant green (same as primary)
  inactive: "#B0BEC5", // Soft grey
  text: "#2E3B44", // Deep charcoal grey
  lightText: "#4A5963", // Deep charcoal grey
  link: "#1E88E5", // Crisp, deep sky blue (same as light theme)
  placeholder: "#B0BEC5", // Matches inactive color
  border: "#B0BEC5", // Soft grey (same as inactive)
  error: "#d5304f", // Soft grey (same as inactive)
  card: "#ECEFF1",
  cardText: "#2E3B44",
  success: "#66BB6A", // Modern vibrant green
  wordBackground: "#f0f0f0", // Light background color for better contrast
  wordHighlightBackground: "#d3f8d3", // Light green background color for clicked words
  buttonText: "#2E3B44",
};

export const darkThemeColors: ThemeColors = {
  primary: "#66BB6A", // Lively modern green
  secondary: "#FFB300", // Richer gold
  tertiary: "#d5304f", // Red
  background: "#263238", // Dark slate
  active: "#66BB6A", // Lively modern green (same as primary)
  inactive: "#B0BEC5", // Cooler, muted blue-grey
  text: "#FAFAFA", // Very light grey (almost white)
  lightText: "#CFD8DC", // Deep charcoal grey
  link: "#82CAFF", // Crisp, deep sky blue (same as light theme)
  placeholder: "#607D8B",
  border: "#37474F", // Darker shade for borders, adjusted for dark theme
  error: "#d5304f", // Soft grey (same as inactive)
  card: "#FAFAFA",
  cardText: "#263238",
  success: "#66BB6A", // Modern vibrant green
  wordBackground: "#37474F", // Darker background color for better contrast
  wordHighlightBackground: "#66BB6A", // Modern vibrant green background color for clicked words
  buttonText: "#2E3B44",
};
