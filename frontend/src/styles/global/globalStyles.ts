import { ThemeColors } from "../theme/colors";
import { createTextStyles } from "../textStyles";
import { createLayoutStyles } from "../layouts/layoutStyles";
import { createComponentStyles } from "../components/componentStyles";

export const getGlobalStyles = (colors: ThemeColors) => ({
  ...createTextStyles(colors),
  ...createLayoutStyles(colors),
  ...createComponentStyles(colors),
});
