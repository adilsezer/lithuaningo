import { StyleSheet, Dimensions, Platform } from "react-native";
import { ThemeColors } from "@styles/colors";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

export const createBaseStyles = (colors: ThemeColors) => ({
  // Layout styles
  layout: StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    center: {
      alignItems: "center",
    },
    fullScreenCenter: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  }),

  // Component styles
  components: StyleSheet.create({
    input: {
      width: "100%",
      marginVertical: isTablet ? 15 : 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: isTablet ? 25 : 20,
      borderRadius: 10,
      color: colors.lightText,
      fontFamily: "Roboto-Bold",
      fontSize: isTablet ? 24 : 16,
      paddingTop: isTablet ? 32 : 28,
      paddingBottom: isTablet ? 25 : 20,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: isTablet ? 25 : 20,
      width: isTablet ? "90%" : "75%",
      alignItems: "center",
      marginVertical: isTablet ? 20 : 16,
      alignSelf: "center",
    },
  }),
});
