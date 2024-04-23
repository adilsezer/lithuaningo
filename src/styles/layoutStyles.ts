// styles/layoutStyles.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from "./colors";

export const createLayoutStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pageStyle: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    layoutContainer: {
      flex: 1, // This will make sure the container expands
      width: "100%",
    },
    viewContainer: {
      width: "100%",
    },
    centerContainer: {
      alignItems: "center",
    },
    leftContainer: {
      alignItems: "flex-start",
    },
    rightContainer: {
      alignItems: "flex-end",
    },
    fullScreenCenter: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
