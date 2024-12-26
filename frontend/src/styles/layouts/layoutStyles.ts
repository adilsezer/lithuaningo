import { StyleSheet } from "react-native";
import { ThemeColors } from "../theme/colors";

export const createLayoutStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pageStyle: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    layoutContainer: {
      flex: 1,
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
  });
