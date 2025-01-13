import { useMemo } from "react";
import { Dimensions, Platform } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

export const TAB_ITEMS = [
  { name: "index", title: "Home", icon: "home" },
  { name: "decks", title: "Decks", icon: "book" },
  { name: "challenge", title: "Challenge", icon: "pencil" },
  { name: "leaderboard", title: "Leaders", icon: "trophy" },
  { name: "profile", title: "Profile", icon: "user" },
] as const;

export const useTabLayout = () => {
  const { colors } = useThemeStyles();

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: colors.active,
      tabBarStyle: {
        height: 60,
        paddingTop: 10,
        paddingBottom: 0,
        elevation: 0,
        backgroundColor: "transparent",
      },
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: isTablet ? 20 : 10,
      },
      sceneStyle: {
        backgroundColor: "transparent",
        flex: 1,
      },
    }),
    [colors.active]
  );

  return {
    screenOptions,
    tabItems: TAB_ITEMS,
    backBehavior: "history" as const,
  };
};
