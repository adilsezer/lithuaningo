// styles/textStyles.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from "./colors";

export const createTextStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    paragraph: {
      marginVertical: 10,
      lineHeight: 20,
      color: colors.text,
      fontFamily: "Roboto",
    },
    title: {
      fontSize: 24,
      marginVertical: 10,
      color: colors.text,
      fontFamily: "Roboto-Bold", // Bold font for titles
      textAlign: "center",
    },
    subtitle: {
      fontSize: 18,
      marginVertical: 10,
      color: colors.text,
      fontFamily: "Roboto",
      textAlign: "center",
    },
    text: {
      color: colors.text,
      fontFamily: "Roboto",
      marginVertical: 5,
      textAlign: "center",
    },
    buttonText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: "Roboto-Bold",
    },
    tabText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: "Roboto",
    },
    activeTabText: {
      color: colors.text,
      fontFamily: "Roboto-Bold",
    },
  });
