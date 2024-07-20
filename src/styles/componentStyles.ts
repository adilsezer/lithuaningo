// styles/componentStyles.ts
import { StyleSheet, Dimensions, Platform } from "react-native";
import { ThemeColors } from "./colors";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

export const createComponentStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    input: {
      backgroundColor: colors.inputBackground,
      width: "100%",
      marginVertical: isTablet ? 15 : 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: isTablet ? 25 : 20,
      borderRadius: 10,
      color: colors.lightText,
      fontFamily: "Roboto-Bold",
      fontSize: isTablet ? 24 : 16,
      paddingTop: isTablet ? 50 : 30,
      paddingBottom: isTablet ? 20 : 15,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: isTablet ? 25 : 20,
      paddingHorizontal: isTablet ? 25 : 20,
      borderRadius: 10,
      marginVertical: isTablet ? 15 : 10,
      width: isTablet ? "90%" : "75%",
      justifyContent: "center",
    },
    icon: {
      width: isTablet ? 25 : 20,
      height: isTablet ? 25 : 20,
      marginRight: isTablet ? 15 : 10,
    },
  });
