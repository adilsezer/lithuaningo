// styles/textStyles.ts
import { StyleSheet, Dimensions, Platform } from "react-native";
import { ThemeColors } from "./colors";

const { width } = Dimensions.get("window");

const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

export const createTextStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    paragraph: {
      marginVertical: isTablet ? 15 : 10,
      lineHeight: isTablet ? 24 : 20,
      color: colors.text,
      fontFamily: "Roboto",
    },
    title: {
      fontSize: isTablet ? 32 : 24,
      marginVertical: isTablet ? 15 : 10,
      color: colors.text,
      fontFamily: "Roboto-Bold",
      textAlign: "center",
    },
    subtitle: {
      fontSize: isTablet ? 24 : 18,
      marginVertical: isTablet ? 15 : 10,
      color: colors.text,
      fontFamily: "Roboto",
      textAlign: "center",
    },
    text: {
      color: colors.text,
      fontFamily: "Roboto",
      marginVertical: isTablet ? 10 : 5,
      textAlign: "center",
    },
    buttonText: {
      fontSize: isTablet ? 18 : 14,
      color: colors.text,
      fontFamily: "Roboto-Bold",
    },
    tabText: {
      fontSize: isTablet ? 20 : 16,
      color: colors.text,
      fontFamily: "Roboto",
    },
    activeTabText: {
      color: colors.text,
      fontFamily: "Roboto-Bold",
    },
  });
