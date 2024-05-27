// styles/componentStyles.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from "./colors";

export const createComponentStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    input: {
      width: "100%",
      marginVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      borderRadius: 10,
      color: colors.text,
      fontFamily: "Roboto",
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginVertical: 10,
      width: 200,
      justifyContent: "center",
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 10,
    },
  });
