// styles/textStyles.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from "./colors";

export const createTextStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    paragraph: {
      marginVertical: 10,
      lineHeight: 20,
      color: colors.text,
    },
    title: {
      fontSize: 24,
      marginVertical: 10,
      color: colors.text,
      fontWeight: "bold",
    },
    text: {
      color: colors.text,
    },
    buttonText: {
      fontWeight: "bold",
      color: colors.text,
    },
    tabText: {
      fontSize: 16,
      color: colors.text,
    },
    activeTabText: {
      color: colors.text,
    },
    orText: {
      width: 50,
      textAlign: "center",
      color: colors.text,
    },
  });
