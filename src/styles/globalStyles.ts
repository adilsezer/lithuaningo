// styles/globalStyles.ts
import { ThemeColors } from "./colors";
import { createTextStyles } from "./textStyles";
import { createLayoutStyles } from "./layoutStyles";
import { createComponentStyles } from "./componentStyles";
import { createNavigationStyles } from "./navigationStyles";

export const getGlobalStyles = (colors: ThemeColors) => ({
  ...createTextStyles(colors),
  ...createLayoutStyles(colors),
  ...createComponentStyles(colors),
  ...createNavigationStyles(colors),
});
