// styles/layoutStyles.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from "./colors";

export const createLayoutStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pageStyle: {
      flex: 1,
      backgroundColor: colors.background,
    },
    viewContainer: {
      width: "100%",
      alignItems: "center",
      padding: 20,
    },
    separator: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginVertical: 10,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
  });
