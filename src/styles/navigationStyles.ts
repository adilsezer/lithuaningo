// styles/navigationStyles.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from "./colors";

export const createNavigationStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 5,
    },
    tab: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      marginHorizontal: 5,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeTab: {
      backgroundColor: colors.active,
    },
    inactiveTab: {
      backgroundColor: colors.inactive,
      opacity: 0.8,
    },
    tabText: {
      fontSize: 16,
      color: colors.text,
    },
    activeTabText: {
      color: colors.text,
    },
  });
