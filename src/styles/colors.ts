export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  active: string;
  inactive: string;
  text: string;
  link: string;
  placeholder: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  loading: string;
};

export const lightThemeColors: ThemeColors = {
  primary: "#66BB6A", // Modern vibrant green
  secondary: "#FFC107", // Warm amber
  background: "#FFFFFF", // Pure white
  active: "#66BB6A", // Modern vibrant green (same as primary)
  inactive: "#B0BEC5", // Soft grey
  text: "#2E3B44", // Deep charcoal grey
  link: "#1E88E5", // Crisp, deep sky blue (same as light theme)
  placeholder: "#B0BEC5", // Matches inactive color
  border: "#B0BEC5", // Soft grey (same as inactive)
  success: "#66BB6A", // Modern vibrant green (same as primary)
  error: "#C62828", // Sleek, red
  warning: "#FFA000", // Modern, earthy gold
  info: "#1E88E5", // Crisp, deep sky blue
  loading: "#FFFFFF", // Modern vibrant green (same as primary)
};

export const darkThemeColors: ThemeColors = {
  primary: "#66BB6A", // Lively modern green
  secondary: "#FFB300", // Richer gold
  background: "#263238", // Dark slate
  active: "#66BB6A", // Lively modern green (same as primary)
  inactive: "#455A64", // Cooler, muted blue-grey
  text: "#FAFAFA", // Very light grey (almost white)
  link: "#1E88E5", // Crisp, deep sky blue (same as light theme)
  placeholder: "#CFD8DC", // Lighter blue-grey for placeholders, adjusted for dark theme
  border: "#37474F", // Darker shade for borders, adjusted for dark theme
  success: "#66BB6A", // Lively modern green (same as primary)
  error: "#C62828", // Sleek, red (same as light theme)
  warning: "#FFA000", // Modern, earthy gold (adjusted to match light theme warning)
  info: "#1E88E5", // Crisp, deep sky blue (same as light theme)
  loading: "#FFFFFF", // Matches inactive color
};
